import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginationService } from '../../helpers/services/pagination.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { InfluencerDto, InfluencerItem } from './dto/influencer.dto';
import { InfluencerValidateFileService } from './influencer-validate-file.service';
import { Influencer } from './entities/influencer.entity';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { v4 as uuidv4 } from 'uuid';
import { Influence } from './entities/influence.entity';
import { FileUploadResponseDto } from '../upload-file/dto/file-upload-response.dto';
import { Stakeholder } from '../stakeholder/entities/stakeholder.entity';
import { ApiProcessService } from '../../api-service/api-process.service';
import { Pagination } from '../../contracts/pagination.contract';
import { InfluencerFilter } from '../../helpers/filters/influencer.filter';
import { InfluencerSorting } from '../../helpers/sortings/influencer.sorting';
import { InfluencerUpdate } from './dto/influencer-update.dto';
import { InfluenceTypes } from '../../enum/influence-types.enum';

@Injectable()
export class InfluencerService extends PaginationService {
  constructor(
    @Inject(ApiProcessService)
    private apiProcessService: ApiProcessService,
    @Inject(InfluencerValidateFileService)
    private influencerValidateService: InfluencerValidateFileService,
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    @InjectRepository(Influence)
    private influenceRepository: Repository<Influence>,
    @InjectRepository(Stakeholder)
    private stakeholderRepository: Repository<Stakeholder>,
  ) {
    super();
  }

  async influencerCreate(
    token: string,
    projectId: string,
    processId: string,
    dto: InfluencerDto,
  ): Promise<FileUploadResponseDto> {
    await this.apiProcessService.getProcessByProject(
      token,
      projectId,
      processId,
    );
    await this.influencerValidateService.validateFile(
      token,
      projectId,
      processId,
      dto,
    );
    if (dto.hasErrors) {
      const errorsFileResponse = {
        message: dto.items.map(({ row, errors }) => ({
          row,
          errors,
        })),
      };
      throw new BadRequestException(errorsFileResponse);
    }

    const insertInfluencers = dto.items.filter(
      (i) => i.action === UploadFileAction.add,
    ) as InfluencerItem[];
    const deleteInfluencers = dto.items.filter(
      (i) => i.action === UploadFileAction.delete,
    ) as InfluencerItem[];

    await this.handleInserts(projectId, processId, insertInfluencers);
    await this.handleDeletions(projectId, processId, deleteInfluencers);
    const responseDto: FileUploadResponseDto = {
      name: dto.file,
      updates: 0,
      additions: insertInfluencers.length,
      deletions: deleteInfluencers.length,
    };
    return responseDto;
  }

  private async handleInserts(
    projectId: string,
    processId: string,
    influencersDto: InfluencerItem[],
  ): Promise<void> {
    if (influencersDto.length === 0) return;

    const influencers: Influencer[] = [];
    const influencesEntity: Influence[] = [];
    for (const dto of influencersDto) {
      const stakeholder = await this.stakeholderRepository.findOne({
        where: { id: dto.stakeholderId },
      });
      const isExcluded: boolean = dto.excluded === 'TRUE' ? true : false;
      const id = uuidv4();

      const influencer = this.influencerRepository.create({
        id,
        projectId,
        isExcluded,
        selectedFutureProcess: processId,
        stakeholder,
      });
      influencers.push(influencer);
      const influences = await this.handleInsertsInfluence(
        dto.influence,
        influencer,
      );
      influencesEntity.push(...influences);
    }
    await this.influencerRepository.save(influencers);
    await this.influenceRepository.save(influencesEntity);
  }

  private async handleInsertsInfluence(
    influencesDto: string,
    influencer: Influencer,
  ): Promise<Influence[]> {
    const influences = influencesDto.split('|');
    const influencesEntity: Influence[] = [];
    for (const item of influences) {
      const influence = this.influenceRepository.create({
        type: item,
        influencer,
      });
      influencesEntity.push(influence);
    }
    return influencesEntity;
  }

  private async handleDeletions(
    projectId: string,
    processId: string,
    influencersDto: InfluencerItem[],
  ): Promise<void> {
    if (influencersDto.length === 0) return;

    const influencers: Influencer[] = [];
    for (const dto of influencersDto) {
      const existingInfluencer = await this.influencerRepository.findOne({
        where: {
          projectId,
          selectedFutureProcess: processId,
          stakeholder: { id: dto.stakeholderId },
        },
      });
      if (existingInfluencer) {
        influencers.push(existingInfluencer);
        await this.influenceRepository.softDelete({
          influencer: existingInfluencer,
        });
      }
    }
    await this.influencerRepository.softRemove(influencers);
  }

  async findOne(projectId: string, id: string): Promise<Influencer> {
    const influencer = await this.influencerRepository
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.influences', 'influences')
      .leftJoinAndSelect('influencer.stakeholder', 's')
      .leftJoinAndSelect('s.projectRole', 'projectRole')
      .leftJoinAndSelect('s.stakeholderUser', 'user')
      .leftJoinAndSelect('s.stakeholderDepartmentPositions', 'sdp')
      .leftJoinAndSelect('sdp.position', 'position')
      .andWhere('influencer.projectId = :projectId', {
        projectId,
      })
      .andWhere('influencer.id = :id', {
        id,
      })
      .getOne();

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return influencer;
  }

  async updateProcessInfluences(
    projectId: string,
    id: string,
    dto: InfluencerUpdate,
  ): Promise<Influencer> {
    const influencer = await this.getInfluencer(id, projectId, dto.processId);

    if (dto.influences.mapper) {
      await this.validateMapperInfluence(influencer.id, dto.processId);
    }
    try {
      await this.influenceRepository.manager.transaction(async (manager) => {
        await this.insertOrDeleteInfluences(manager, influencer, dto);
        influencer.isExcluded = dto.excluded;
        await manager.getRepository(Influencer).save(influencer);
      });
    } catch (error) {
      Logger.error(error, 'Error -> update influencer');
      throw new BadRequestException(error);
    }
    return await this.findOne(projectId, id);
  }

  private async getInfluencer(
    id: string,
    projectId: string,
    processId: string,
  ): Promise<Influencer> {
    const influencer = await this.influencerRepository.findOne({
      where: { id, projectId, selectedFutureProcess: processId },
      relations: ['influences'],
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return influencer;
  }

  private async validateMapperInfluence(
    influencerId: string,
    processId: string,
  ): Promise<void> {
    const existingMapper = await this.influenceRepository.findOne({
      where: {
        type: InfluenceTypes.mapper,
        influencer: { selectedFutureProcess: processId },
      },
      relations: ['influencer'],
    });

    if (existingMapper && existingMapper.influencer.id !== influencerId) {
      throw new ConflictException('Influence MAPPER already exists');
    }
  }

  private async insertOrDeleteInfluences(
    manager: EntityManager,
    influencer: Influencer,
    dto: InfluencerUpdate,
  ) {
    const influencesToDelete = influencer.influences.filter(
      (influence) => !dto.influences[influence.type.toLowerCase()],
    );
    await manager.getRepository(Influence).remove(influencesToDelete);
    for (const [type, value] of Object.entries(dto.influences)) {
      if (
        value &&
        !influencer.influences.some(
          (influence) => influence.type === type.toUpperCase(),
        )
      ) {
        const newInfluence = new Influence();
        newInfluence.type = type.toUpperCase();
        newInfluence.influencer = influencer;
        await manager.getRepository(Influence).save(newInfluence);
        influencer.influences.push(newInfluence);
      }
    }
  }

  async filter(
    projectId: string,
    filter: InfluencerFilter,
    sorting: InfluencerSorting,
    pagination: Pagination,
  ): Promise<any> {
    const queryBuilder = this.influencerRepository
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.influences', 'influences')
      .leftJoinAndSelect('influencer.stakeholder', 's')
      .leftJoinAndSelect('s.projectRole', 'projectRole')
      .leftJoinAndSelect('s.stakeholderDepartmentPositions', 'sdp')
      .leftJoinAndSelect('sdp.department', 'department')
      .leftJoinAndSelect('sdp.position', 'position')
      .andWhere('influencer.projectId = :projectId', {
        projectId,
      });

    this.applyFilter(queryBuilder, filter);
    this.applySorting(queryBuilder, sorting);

    return await this.paginate(queryBuilder, pagination);
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Influencer>,
    sorting: InfluencerSorting,
  ): void {
    const { name, excluded, projectRoles } = sorting;

    if (name) {
      queryBuilder.addOrderBy('s.name', name);
    }

    if (excluded) {
      queryBuilder.addOrderBy('influencer.isExcluded', excluded);
    }

    if (projectRoles) {
      queryBuilder.addOrderBy('projectRole.name', projectRoles);
    }
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<Influencer>,
    filter: InfluencerFilter,
  ): void {
    const {
      processId,
      name,
      departments,
      positions,
      excluded,
      influences,
      projectRoles,
    } = filter;

    if (processId) {
      queryBuilder.andWhere('influencer.selectedFutureProcess = :id', {
        id: filter.processId,
      });
    }
    if (name) {
      queryBuilder.andWhere(
        `s.name LIKE :stakeholderParam OR s.code LIKE :stakeholderParam`,
        { stakeholderParam: `%${name}%` },
      );
    }

    if (projectRoles) {
      queryBuilder.andWhere(`projectRole.id IN (:...projectRoles)`, {
        projectRoles,
      });
    }

    if (excluded !== undefined) {
      if (excluded == 'true') {
        queryBuilder.andWhere(`influencer.isExcluded = true`);
      }
      if (excluded == 'false') {
        queryBuilder.andWhere(`influencer.isExcluded = false`);
      }
    }

    if (departments && departments.length > 0) {
      queryBuilder.andWhere(
        `EXISTS (SELECT 1 FROM stakeholder_department_position WHERE stakeholder_department_position.stakeholder_id = s.id AND stakeholder_department_position.deleted_at is null AND stakeholder_department_position.department_id IN (:...departments))`,
        { departments },
      );
    }

    if (positions && positions.length > 0) {
      queryBuilder.andWhere(
        `EXISTS (SELECT 1 FROM stakeholder_department_position WHERE stakeholder_department_position.stakeholder_id = s.id AND stakeholder_department_position.deleted_at is null AND stakeholder_department_position.position_id IN (:...positions))`,
        { positions },
      );
    }
    if (influences && influences.length > 0) {
      queryBuilder.andWhere(
        `EXISTS (SELECT 1 FROM influence WHERE influence.influencerId = influencer.id AND influence.deleted_at is null AND influence.type IN (:...influences))`,
        { influences },
      );
    }
  }
}
