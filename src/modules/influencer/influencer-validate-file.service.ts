import { Injectable } from '@nestjs/common';
import { CountMap, InfluencerDto, InfluencerItem } from './dto/influencer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Influencer } from './entities/influencer.entity';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { InfluenceTypes } from '../../enum/influence-types.enum';
import { isNumber } from '../../utils/validate';
import { Stakeholder } from '../stakeholder/entities/stakeholder.entity';

@Injectable()
export class InfluencerValidateFileService {
  constructor(
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    @InjectRepository(Stakeholder)
    private stakeholderRepository: Repository<Stakeholder>,
  ) {}

  async validateFile(
    token: string,
    projectId: string,
    processId: string,
    fileDto: InfluencerDto,
  ): Promise<void> {
    const stakeholderCodes = this.getCountMap(fileDto.stakeholderIds);
    for (const item of fileDto.items) {
      await this.validateItems(projectId, processId, item, stakeholderCodes);
    }
    await this.validateMapper(processId, fileDto.items);
    if (fileDto.items.some((item) => item.errors.length > 0)) {
      fileDto.hasErrors = true;
    }
  }

  getCountMap(arr: string[]): CountMap {
    return arr.reduce((countMap: CountMap, item) => {
      countMap[item] = (countMap[item] || 0) + 1;
      return countMap;
    }, {});
  }

  private async validateItems(
    projectId: string,
    processId: string,
    item: InfluencerItem,
    stakeholderCodes: CountMap,
  ) {
    await this.validateAction(item.action, item.errors);
    await this.validateInfluence(item.influence, item.errors);
    await this.validateExcluded(item.excluded, item.errors);
    await this.validateStakeholders(
      item,
      projectId,
      processId,
      stakeholderCodes,
    );
  }

  private async validateStakeholders(
    item: InfluencerItem,
    projectId: string,
    processId: string,
    stakeholderIds: CountMap,
  ) {
    if (stakeholderIds[item.stakeholderCode] > 1) {
      item.errors.push(
        `Invalid column 'stakeholderId', duplicated in this file.`,
      );
    }
    if (!isNumber(item.stakeholderCode)) {
      item.errors.push(`Invalid column 'stakeholderId', must be numeric.`);
    }
    const stakeholderExisting = await this.stakeholderRepository.findOne({
      where: { code: parseInt(item.stakeholderCode), projectId },
    });
    if (!stakeholderExisting) {
      item.errors.push(
        `Invalid column 'stakeholderId', cannot be found in database.`,
      );
    } else {
      item.stakeholderId = stakeholderExisting.id;
      const influencer = await this.influencerRepository.findOne({
        where: {
          selectedFutureProcess: processId,
          stakeholder: { id: stakeholderExisting.id },
        },
      });
      if (!influencer && item.action === UploadFileAction.delete) {
        item.errors.push(
          `Invalid column 'stakeholderId', influencer cannot be found in database.`,
        );
      }
      if (influencer && item.action === UploadFileAction.add) {
        item.errors.push(
          `Invalid column 'stakeholderId', influencer already exist.`,
        );
      }
    }
  }

  private async validateAction(action: string, errors: string[]) {
    const validActions = [UploadFileAction.add, UploadFileAction.delete];
    if (!validActions.includes(action as UploadFileAction)) {
      errors.push(`Invalid column 'action', must be completed with (A, D)`);
    }
  }

  private async validateInfluence(item: string, errors: string[]) {
    const validInfluences = [
      InfluenceTypes.sme,
      InfluenceTypes.skl,
      InfluenceTypes.pkl,
      InfluenceTypes.mapper,
      InfluenceTypes.influencer,
    ];
    const influences = item.split('|');
    const uniqueInfluences = new Set(influences);
    if (uniqueInfluences.size !== influences.length) {
      errors.push('Invalid column influence, must be unique.');
    }

    uniqueInfluences.forEach((infl: string) => {
      if (!validInfluences.includes(infl as InfluenceTypes)) {
        errors.push(
          `Invalid column influence '${infl}', must be one of ('SME','PKL','SKL','MAPPER','INFLUENCER')`,
        );
      }
    });
  }

  private async validateExcluded(item: string, errors: string[]) {
    const validValues = new Set(['TRUE', 'FALSE']);
    if (!validValues.has(item)) {
      errors.push(`Invalid column excluded, must be 'TRUE' or 'FALSE'`);
    }
  }

  private async validateMapper(processId: string, items: InfluencerItem[]) {
    let mapperCount = 0;
    const queryBuilder = this.influencerRepository
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.influences', 'influences')
      .where('influencer.selectedFutureProcess = :id', { id: processId })
      .andWhere('influences.type = :type', { type: InfluenceTypes.mapper });

    const influencerMapper = await queryBuilder.getMany();
    for (const item of items) {
      if (item.action !== UploadFileAction.delete) {
        const influences = item.influence.split('|');
        if (influences.includes(InfluenceTypes.mapper)) {
          mapperCount++;
          if (influencerMapper.length) {
            item.errors.push(
              `Invalid column influence, 'MAPPER' influence already exists in the database.`,
            );
          }
        }
      }
    }

    if (mapperCount > 1) {
      for (const item of items) {
        if (item.influence.includes(InfluenceTypes.mapper)) {
          item.errors.push(
            `Invalid column influence, multiple occurrences of 'MAPPER' influence found in this file.`,
          );
        }
      }
    }
  }
}
