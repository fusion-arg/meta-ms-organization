import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { Position } from './entities/position.entity';
import { PositionDto, PositionFileDto } from './dto/position.dto';
import { ValidateFileService } from '../upload-file/validate-file.service';
import { isNumber } from '../../utils/validate';

@Injectable()
export class PositionsValidateService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @Inject(ValidateFileService)
    private validateFileService: ValidateFileService,
  ) {}

  async validatePosition(
    projectId: string,
    positionsFileDto: PositionFileDto,
  ): Promise<void> {
    await this.validateFileService.validateFile(positionsFileDto);
    for (const item of positionsFileDto.items) {
      await this.validateItems(projectId, item);
    }
    if (positionsFileDto.items.some((item) => item.errors.length > 0)) {
      positionsFileDto.hasErrors = true;
    }
  }

  private async validateItems(projectId: string, item: PositionDto) {
    await this.validateName(projectId, item);
    await this.validateCode(projectId, item);
  }

  private async validateName(
    projectId: string,
    item: PositionDto,
  ): Promise<void> {
    const positionByName = await this.positionRepository.findOne({
      where: { projectId, name: item.name },
    });
    if (item.action === UploadFileAction.add && positionByName) {
      item.errors.push(`Invalid column 'name', already exists in database.`);
    }
    if (
      item.action === UploadFileAction.update &&
      positionByName &&
      positionByName.externalId !== parseInt(item.code)
    ) {
      item.errors.push(
        `Invalid column 'name', already exists for another position in database.`,
      );
    }
  }

  private async validateCode(projectId: string, item: PositionDto) {
    if (isNumber(item.code)) {
      const positionByExternalId = await this.positionRepository.findOne({
        where: { projectId, externalId: parseInt(item.code) },
        relations: ['stakeholderDepartmentPositions'],
      });

      if (item.action === UploadFileAction.add && positionByExternalId) {
        item.errors.push(`Invalid column 'code', already exists in database.`);
      }
      if (
        (item.action === UploadFileAction.update ||
          item.action === UploadFileAction.delete) &&
        !positionByExternalId
      ) {
        item.errors.push(`Invalid column 'code', cannot be found in database.`);
      }
      if (item.action === UploadFileAction.delete && positionByExternalId) {
        if (positionByExternalId.stakeholderDepartmentPositions.length) {
          item.errors.push(
            `Invalid column 'code', all stakeholders must be deleted too`,
          );
        }
      }
    }
  }
}
