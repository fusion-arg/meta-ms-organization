import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationService } from '../../helpers/services/pagination.service';
import { SprintFilter } from '../../helpers/filters/sprint.filter';
import { SprintSorting } from '../../helpers/sortings/sprint.sorting';
import { Pagination } from '../../contracts/pagination.contract';
import { InjectRepository } from '@nestjs/typeorm';
import { Sprint } from './entities/sprint.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SprintDto } from './dto/sprint.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SprintService extends PaginationService {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepo: Repository<Sprint>,
  ) {
    super();
  }

  async filter(
    projectId: string,
    filter: SprintFilter,
    sorting: SprintSorting,
    pagination: Pagination,
  ) {
    const queryBuilder = this.sprintRepo.createQueryBuilder('sprint');
    queryBuilder.andWhere('sprint.projectId = :projectId', { projectId });

    this.applyFilter(queryBuilder, filter);
    this.applySorting(queryBuilder, sorting);

    return await this.paginate(queryBuilder, pagination);
  }

  async findOne(id: string): Promise<Sprint> {
    const sprint = await this.findSprintById(id);

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return sprint;
  }

  private async findSprintById(id: string): Promise<Sprint> {
    return await this.sprintRepo
      .createQueryBuilder('sprint')
      .where('sprint.id = :id', { id })
      .getOne();
  }

  async findSprintForSurvey(id: string) {
    const sprint = await this.findSprintById(id);
    if (!sprint) return null;
    return { id: sprint.id, name: sprint.name };
  }

  async create(data: SprintDto, projectId: string): Promise<Sprint> {
    const { name, code, startDate, endDate } = data;

    if (startDate > endDate) {
      throw new BadRequestException(
        'End date must be greater than or equal to startDate',
      );
    }

    const existingSprint = await this.sprintRepo.findOne({
      where: { code, projectId },
    });
    if (existingSprint) {
      throw new ConflictException('Sprint with the same code already exists.');
    }

    const sprint = this.sprintRepo.create({
      id: uuidv4(),
      name,
      code,
      startDate,
      dueDate: endDate,
      projectId,
    });

    await this.sprintRepo.save(sprint);
    return sprint;
  }

  async remove(id: string) {
    const sprint = await this.sprintRepo.findOneBy({ id });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return this.sprintRepo.softRemove(sprint);
  }

  async update(
    id: string,
    data: SprintDto,
    projectId: string,
  ): Promise<Sprint> {
    if (data.startDate > data.endDate) {
      throw new BadRequestException(
        'End date must be greater than or equal to startDate',
      );
    }

    const sprintEntity = await this.findOne(id);
    if (data.code !== sprintEntity.code) {
      const existingSprint = await this.sprintRepo.findOne({
        where: { code: data.code, projectId },
      });
      if (existingSprint) {
        throw new ConflictException(
          'Sprint with the same code already exists.',
        );
      }
    }

    sprintEntity.code = data.code;
    sprintEntity.name = data.name;
    sprintEntity.startDate = data.startDate;
    sprintEntity.dueDate = data.endDate;

    await this.sprintRepo.save(sprintEntity);

    return await this.findOne(id);
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Sprint>,
    sorting: SprintSorting,
  ): void {
    const { name, code, startDate, dueDate } = sorting;

    if (name) {
      queryBuilder.addOrderBy('sprint.name', name);
    }

    if (code) {
      queryBuilder.addOrderBy('sprint.code', code);
    }

    if (startDate) {
      queryBuilder.addOrderBy('sprint.startDate', startDate);
    }

    if (dueDate) {
      queryBuilder.addOrderBy('sprint.dueDate', dueDate);
    }
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<Sprint>,
    filter: SprintFilter,
  ): void {
    const { sprint, startDate, endDate } = filter;

    if (sprint) {
      queryBuilder.andWhere(
        `sprint.name LIKE :sprintParam OR sprint.code LIKE :sprintParam`,
        { sprintParam: `%${sprint}%` },
      );
    }

    if (startDate) {
      queryBuilder.andWhere(`sprint.startDate >= :valueGT`, {
        valueGT: startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere(`sprint.dueDate <= :valueLT`, { valueLT: endDate });
    }
  }

  async findRecommendedSprint(projectId: string): Promise<Sprint> {
    return await this.sprintRepo.findOne({
      where: { projectId },
      order: { code: 'DESC' },
    });
  }
}
