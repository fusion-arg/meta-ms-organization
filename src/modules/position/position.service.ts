import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PaginationService } from '../../helpers/services/pagination.service';
import { PositionFilter } from '../../helpers/filters/position.filter';
import { PositionSorting } from '../../helpers/sortings/position.sorting';
import { Pagination } from '../../contracts/pagination.contract';
import { Position } from './entities/position.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FileUploadResponseDto } from '../upload-file/dto/file-upload-response.dto';
import { PositionDto, PositionFileDto } from './dto/position.dto';
import { PositionsValidateService } from './positions-validate.service';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PositionService extends PaginationService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @Inject(PositionsValidateService)
    private positionsValidateService: PositionsValidateService,
  ) {
    super();
  }

  async filter(
    projectId: string,
    filter: PositionFilter,
    sorting: PositionSorting,
    pagination: Pagination,
  ) {
    const queryBuilder = this.positionRepository
      .createQueryBuilder('position')
      .andWhere('position.projectId = :projectId', { projectId });

    this.applyFilter(queryBuilder, filter);
    this.applySorting(queryBuilder, sorting);

    return await this.paginate(queryBuilder, pagination);
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<Position>,
    filter: PositionFilter,
  ): void {
    const { code, name, hasStakeholder, updatedAtFrom, updatedAtTo } = filter;

    if (code) {
      queryBuilder.andWhere(`position.externalId = :codeParam`, {
        codeParam: code,
      });
    }

    if (name) {
      queryBuilder.andWhere(`position.name LIKE :nameParam`, {
        nameParam: `%${name}%`,
      });
    }

    if (updatedAtFrom) {
      queryBuilder.andWhere(`position.updatedAt >= :valueGT`, {
        valueGT: updatedAtFrom,
      });
    }

    if (updatedAtTo) {
      queryBuilder.andWhere(`position.updatedAt <= :valueLT`, {
        valueLT: updatedAtTo,
      });
    }

    if (hasStakeholder !== undefined) {
      const booleanValue: boolean = hasStakeholder === 'true';
      if (booleanValue === true) {
        queryBuilder.andWhere(
          `EXISTS (SELECT 1 FROM org_stakeholder_department_position as stakeholder_department_position WHERE stakeholder_department_position.position_id = position.id AND stakeholder_department_position.deleted_at is null)`,
        );
      }

      if (booleanValue === false) {
        queryBuilder.andWhere(
          `NOT EXISTS (SELECT 1 FROM org_stakeholder_department_position as stakeholder_department_position WHERE stakeholder_department_position.position_id = position.id AND stakeholder_department_position.deleted_at is null)`,
        );
      }
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Position>,
    sorting: PositionSorting,
  ): void {
    const { name, code, updatedAt } = sorting;

    if (name) {
      queryBuilder.addOrderBy('position.name', name);
    }

    if (code) {
      queryBuilder.addOrderBy('position.externalId', code);
    }

    if (updatedAt) {
      queryBuilder.addOrderBy('position.updatedAt', updatedAt);
    }
  }

  async processPositions(
    projectId: string,
    positionsFileDto: PositionFileDto,
  ): Promise<FileUploadResponseDto> {
    await this.positionsValidateService.validatePosition(
      projectId,
      positionsFileDto,
    );
    if (positionsFileDto.hasErrors) {
      const errorsFileResponse = {
        message: positionsFileDto.items.map(({ row, errors }) => ({
          row,
          errors,
        })),
      };
      throw new BadRequestException(errorsFileResponse);
    }

    const insertPositions = positionsFileDto.items.filter(
      (d) => d.action === UploadFileAction.add,
    );
    const updatePositions = positionsFileDto.items.filter(
      (d) => d.action === UploadFileAction.update,
    );
    const deletePositions = positionsFileDto.items.filter(
      (d) => d.action === UploadFileAction.delete,
    );

    await this.handleInserts(projectId, insertPositions);
    await this.handleUpdates(projectId, updatePositions);
    await this.handleDeletions(projectId, deletePositions);
    const responseDto: FileUploadResponseDto = {
      name: positionsFileDto.file,
      additions: insertPositions.length,
      updates: updatePositions.length,
      deletions: deletePositions.length,
    };
    return responseDto;
  }

  async handleUpdates(
    projectId: string,
    positionsDto: PositionDto[],
  ): Promise<void> {
    if (positionsDto.length === 0) return;
    const positions: Position[] = [];
    for (const dto of positionsDto) {
      const existingPosition = await this.positionRepository.findOne({
        where: { projectId, externalId: parseInt(dto.code) },
      });
      if (existingPosition) {
        existingPosition.name = dto.name;
        positions.push(existingPosition);
      }
    }
    await this.positionRepository.save(positions);
  }

  async handleInserts(
    projectId: string,
    positionsDto: PositionDto[],
  ): Promise<void> {
    if (positionsDto.length === 0) return;

    const positions: Position[] = [];
    for (const dto of positionsDto) {
      const position = this.positionRepository.create({
        id: uuidv4(),
        externalId: parseInt(dto.code),
        name: dto.name,
        projectId,
      });
      positions.push(position);
    }
    await this.positionRepository.save(positions);
  }

  async handleDeletions(
    projectId: string,
    positionsDto: PositionDto[],
  ): Promise<Position[]> {
    if (positionsDto.length === 0) return;

    const positions: Position[] = [];
    for (const dto of positionsDto) {
      const existingPosition = await this.positionRepository.findOne({
        where: { projectId, externalId: parseInt(dto.code) },
      });
      if (existingPosition) positions.push(existingPosition);
    }

    return this.positionRepository.softRemove(positions);
  }
}
