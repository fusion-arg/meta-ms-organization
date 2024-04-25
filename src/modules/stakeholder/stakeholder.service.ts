import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginationService } from '../../helpers/services/pagination.service';
import { StakeholderFilter } from '../../helpers/filters/stakeholder.filter';
import { StakeholderSorting } from '../../helpers/sortings/stakeholder.sorting';
import { Pagination } from '../../contracts/pagination.contract';
import { InjectRepository } from '@nestjs/typeorm';
import { Stakeholder } from './entities/stakeholder.entity';
import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';
import { StakeholderDto, StakeholderFileDto } from './dto/stakeholder.dto';
import { FileUploadResponseDto } from '../upload-file/dto/file-upload-response.dto';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { StakeholderValidateService } from './stakeholder-validate.service';
import { v4 as uuidv4 } from 'uuid';
import { StakeholderDepartmentPosition } from './entities/stakeholder-department-position.entity';
import { Department } from '../department/entities/department.entity';
import { Position } from '../position/entities/position.entity';
import { ApiAuthService } from '../../api-service/api-auth.service';
import { CreateClientUserDto, UserDto } from './dto/create-client-user.dto';
import { ActivateClientUserDto } from './dto/activate-client-user.dto';
import { StakeholderUser } from './entities/stakeholder-user.entity';
import { SegmentationDto } from './dto/segmentation.dto';
import { Influencer } from '../influencer/entities/influencer.entity';
import { ProjectRole } from '../project-role/entities/proyect-role.entity';
import { StakeholderProjectDoleDto } from './dto/stakeholder-project-role.dto';

@Injectable()
export class StakeholderService extends PaginationService {
  constructor(
    @InjectRepository(Stakeholder)
    private stakeholderRepo: Repository<Stakeholder>,
    @InjectRepository(StakeholderUser)
    private stakeholderUserRepo: Repository<StakeholderUser>,
    @InjectRepository(Influencer)
    private influencerRepo: Repository<Influencer>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(ProjectRole)
    private projectRoleRepo: Repository<ProjectRole>,
    @Inject(StakeholderValidateService)
    private stakeholderValidateService: StakeholderValidateService,
    private readonly apiAuthService: ApiAuthService,
  ) {
    super();
  }

  async filter(
    projectId: string,
    filter: StakeholderFilter,
    sorting: StakeholderSorting,
    pagination: Pagination,
  ) {
    const queryBuilder = this.stakeholderQuery();
    queryBuilder.andWhere('stakeholder.projectId = :projectId', { projectId });

    this.applyFilter(queryBuilder, filter);
    this.applySorting(queryBuilder, sorting);

    return await this.paginate(queryBuilder, pagination);
  }

  private stakeholderQuery() {
    const queryBuilder = this.stakeholderRepo
      .createQueryBuilder('stakeholder')
      .leftJoinAndSelect('stakeholder.projectRole', 'projectRole')
      .leftJoinAndSelect('stakeholder.stakeholderDepartmentPositions', 'sdp')
      .leftJoinAndSelect('stakeholder.stakeholderUser', 'user')
      .leftJoinAndSelect('sdp.department', 'department')
      .leftJoinAndSelect('sdp.position', 'position')
      .leftJoinAndSelect('department.manager', 'manager');
    return queryBuilder;
  }

  async findOne(id: string): Promise<Stakeholder> {
    const queryBuilder = this.stakeholderQuery();
    const stakeholder = await queryBuilder
      .where('stakeholder.id = :id', { id })
      .getOne();

    if (!stakeholder) {
      throw new NotFoundException('Stakeholder not found');
    }

    return stakeholder;
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Stakeholder>,
    sorting: StakeholderSorting,
  ): void {
    const { name, code, email, projectRole } = sorting;

    if (name) {
      queryBuilder.addOrderBy('stakeholder.name', name);
    }

    if (code) {
      queryBuilder.addOrderBy('stakeholder.code', code);
    }

    if (email) {
      queryBuilder.addOrderBy('stakeholder.email', email);
    }
    if (projectRole) {
      queryBuilder.addOrderBy('projectRole.name', projectRole);
    }
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<Stakeholder>,
    filter: StakeholderFilter,
  ): void {
    const {
      stakeholder,
      isManager,
      departments,
      positions,
      hasDepartment,
      updatedAtFrom,
      updatedAtTo,
      projectRole,
      isUser,
    } = filter;

    if (stakeholder) {
      queryBuilder.andWhere(
        `stakeholder.name LIKE :stakeholderParam OR stakeholder.code LIKE :stakeholderParam OR stakeholder.email LIKE :stakeholderParam`,
        { stakeholderParam: `%${stakeholder}%` },
      );
    }

    if (projectRole) {
      queryBuilder.andWhere(`projectRole.id IN (:...projectRole)`, {
        projectRole,
      });
    }

    if (updatedAtFrom) {
      queryBuilder.andWhere(`stakeholder.updatedAt >= :updatedAtFrom`, {
        updatedAtFrom,
      });
    }

    if (updatedAtTo) {
      queryBuilder.andWhere(`stakeholder.updatedAt <= :updatedAtTo`, {
        updatedAtTo,
      });
    }

    if (isManager !== undefined) {
      if (isManager == 'true') {
        queryBuilder.andWhere(
          `EXISTS (SELECT 1 FROM org_department as department WHERE department.stakeholder_id = stakeholder.id and department.deleted_at is null)`,
        );
      }

      if (isManager == 'false') {
        queryBuilder.andWhere(
          `NOT EXISTS (SELECT 1 FROM org_department as department WHERE department.stakeholder_id = stakeholder.id and department.deleted_at is null)`,
        );
      }
    }

    if (departments && departments.length > 0) {
      queryBuilder.andWhere(
        `EXISTS (SELECT 1 FROM org_stakeholder_department_position as stakeholder_department_position WHERE stakeholder_department_position.stakeholder_id = stakeholder.id AND stakeholder_department_position.deleted_at is null AND stakeholder_department_position.department_id IN (:...departments))`,
        { departments },
      );
    }

    if (positions && positions.length > 0) {
      queryBuilder.andWhere(
        `EXISTS (SELECT 1 FROM org_stakeholder_department_position as stakeholder_department_position WHERE stakeholder_department_position.stakeholder_id = stakeholder.id AND stakeholder_department_position.deleted_at is null AND stakeholder_department_position.position_id IN (:...positions))`,
        { positions },
      );
    }

    if (hasDepartment !== undefined) {
      if (hasDepartment == 'true') {
        queryBuilder.andWhere(
          `EXISTS (SELECT 1 FROM org_stakeholder_department_position as stakeholder_department_position WHERE stakeholder_department_position.stakeholder_id = stakeholder.id AND stakeholder_department_position.deleted_at is null)`,
        );
      }

      if (hasDepartment == 'false') {
        queryBuilder.andWhere(
          `NOT EXISTS (SELECT 1 FROM org_stakeholder_department_position as stakeholder_department_position WHERE stakeholder_department_position.stakeholder_id = stakeholder.id AND stakeholder_department_position.deleted_at is null)`,
        );
      }
    }

    if (isUser !== undefined) {
      const booleanValue: boolean = isUser === 'true';
      if (booleanValue === true) {
        queryBuilder.andWhere(`user.isUser = TRUE`);
      }
    }
  }

  async processStakeholdersFile(
    token: string,
    projectId: string,
    fileDto: StakeholderFileDto,
  ): Promise<FileUploadResponseDto> {
    await this.stakeholderValidateService.validateStakeholder(
      projectId,
      fileDto,
    );
    if (fileDto.hasErrors) {
      const errorsFileResponse = {
        message: fileDto.items.map(({ row, errors }) => ({
          row,
          errors,
        })),
      };
      throw new BadRequestException(errorsFileResponse);
    }
    const insertStakeholders = fileDto.items.filter(
      (d) => d.action === UploadFileAction.add,
    ) as StakeholderDto[];
    const updateStakeholders = fileDto.items.filter(
      (d) => d.action === UploadFileAction.update,
    ) as StakeholderDto[];
    const deleteStakeholders = fileDto.items.filter(
      (d) => d.action === UploadFileAction.delete,
    ) as StakeholderDto[];

    try {
      const users = await this.stakeholderRepo.manager.transaction(
        async (manager: EntityManager) => {
          await this.handleInserts(manager, projectId, insertStakeholders);
          await this.handleUpdates(manager, projectId, updateStakeholders);
          await this.handleDeletions(manager, projectId, deleteStakeholders);

          const stakeholderToUser: UserDto[] = [
            ...insertStakeholders.map(({ name, email }) => ({ name, email })),
            ...updateStakeholders.map(({ name, email }) => ({ name, email })),
          ];

          const dto: CreateClientUserDto = {
            projectId,
            users: stakeholderToUser,
          };
          return await this.apiAuthService.insertUserStakeholders(token, dto);
        },
      );
      await this.addStakholderUsers(users);
    } catch (error) {
      Logger.error(error, 'Error -> processStakeholdersFile');
      throw new BadRequestException(error);
    }
    const responseDto: FileUploadResponseDto = {
      name: fileDto.file,
      additions: insertStakeholders.length,
      updates: updateStakeholders.length,
      deletions: deleteStakeholders.length,
    };
    return responseDto;
  }

  private async addStakholderUsers(users: any[]) {
    const stakeholders: StakeholderUser[] = [];
    for (const user of users) {
      const stakeholder = await this.stakeholderRepo.findOne({
        where: { email: user.email },
      });
      const stakeholderUser = this.stakeholderUserRepo.create({
        stakeholder,
        userId: user.id,
      });
      stakeholders.push(stakeholderUser);
    }
    await this.stakeholderUserRepo.save(stakeholders);
  }

  async handleInserts(
    manager: EntityManager,
    projectId: string,
    stakeholderDto: StakeholderDto[],
  ): Promise<void> {
    if (stakeholderDto.length === 0) return;
    let lastStakeholder = await this.generateCode(manager);
    const stakeholders: Stakeholder[] = [];
    const departments: Department[] = [];
    const stakeholderDepartmentPositions: StakeholderDepartmentPosition[] = [];
    for (const dto of stakeholderDto) {
      const id = uuidv4();
      const stakeholder = manager.getRepository(Stakeholder).create({
        id,
        code: lastStakeholder,
        name: dto.name,
        email: dto.email,
        projectId,
        projectRole: { id: dto.projectRoleId },
      });
      const spds = await this.insertStakeholderDepartmentPosition(
        manager,
        projectId,
        stakeholder,
        dto,
      );
      lastStakeholder++;
      stakeholders.push(stakeholder);
      stakeholderDepartmentPositions.push(...spds);
      if (dto.manager !== '') {
        const department = await this.setStakeholderManager(
          manager,
          projectId,
          stakeholder,
          dto,
        );

        departments.push(department);
      }
    }
    await manager.getRepository(Stakeholder).save(stakeholders);
    await manager
      .getRepository(StakeholderDepartmentPosition)
      .save(stakeholderDepartmentPositions);
    await manager.getRepository(Department).save(departments);
  }
  private async setStakeholderManager(
    manager: EntityManager,
    projectId: string,
    stakeholder: Stakeholder,
    dto: StakeholderDto,
  ): Promise<Department> {
    const department = await manager.getRepository(Department).findOne({
      where: { code: parseInt(dto.manager), projectId },
    });
    department.manager = stakeholder;
    return department;
  }

  private async unsetStakeholderManager(
    manager: EntityManager,
    projectId: string,
    stakeholder: Stakeholder,
  ): Promise<Department> {
    const department = await manager.getRepository(Department).findOne({
      where: { manager: { id: stakeholder.id }, projectId },
    });

    if (!department) return null;

    department.manager = null;
    return department;
  }
  private async insertStakeholderDepartmentPosition(
    manager: EntityManager,
    projectId: string,
    stakeholder: Stakeholder,
    dto: StakeholderDto,
  ): Promise<StakeholderDepartmentPosition[]> {
    const stakeholderDepartmentPositions: StakeholderDepartmentPosition[] = [];
    for (const item of dto.departmentsAndPositions) {
      const department = await manager.getRepository(Department).findOne({
        where: {
          projectId,
          code: parseInt(item.department),
        },
      });
      for (const position of item.positions) {
        const positionEntity = await manager.getRepository(Position).findOne({
          where: {
            projectId,
            externalId: parseInt(position),
          },
        });
        const sdp = manager
          .getRepository(StakeholderDepartmentPosition)
          .create({
            projectId,
            stakeholder,
            position: positionEntity,
            department,
          });
        stakeholderDepartmentPositions.push(sdp);
      }
    }
    return stakeholderDepartmentPositions;
  }

  private async generateCode(manager: EntityManager) {
    const lastStakeholder = await manager
      .getRepository(Stakeholder)
      .createQueryBuilder('stakeholder')
      .withDeleted()
      .orderBy('stakeholder.code', 'DESC')
      .select(['stakeholder.code'])
      .getOne();

    if (lastStakeholder) {
      return lastStakeholder.code + 1;
    } else {
      return 10000;
    }
  }
  private async handleUpdates(
    manager: EntityManager,
    projectId: string,
    stakeholderDto: StakeholderDto[],
  ): Promise<void> {
    if (stakeholderDto.length === 0) return;
    const stakeholders: Stakeholder[] = [];
    const departments: Department[] = [];
    const stakeholderDepartmentPositions: StakeholderDepartmentPosition[] = [];
    for (const dto of stakeholderDto) {
      const existingStakeholder = await manager
        .getRepository(Stakeholder)
        .findOne({
          where: { projectId, code: parseInt(dto.stakeholderId) },
          relations: ['projectRole'],
        });
      if (existingStakeholder) {
        existingStakeholder.name = dto.name;
        existingStakeholder.projectRole.id = dto.projectRoleId;
        stakeholders.push(existingStakeholder);
      }
      await manager
        .getRepository(StakeholderDepartmentPosition)
        .delete({ stakeholder: existingStakeholder });
      const spds = await this.insertStakeholderDepartmentPosition(
        manager,
        projectId,
        existingStakeholder,
        dto,
      );
      let department = null;
      if (dto.manager !== '') {
        department = await this.setStakeholderManager(
          manager,
          projectId,
          existingStakeholder,
          dto,
        );
      } else {
        department = await this.unsetStakeholderManager(
          manager,
          projectId,
          existingStakeholder,
        );
      }
      if (department) departments.push(department);
      stakeholderDepartmentPositions.push(...spds);
    }
    await manager.getRepository(Stakeholder).save(stakeholders);
    await manager
      .getRepository(StakeholderDepartmentPosition)
      .save(stakeholderDepartmentPositions);
    await manager.getRepository(Department).save(departments);
  }

  private async handleDeletions(
    manager: EntityManager,
    projectId: string,
    stakeholderDto: StakeholderDto[],
  ): Promise<void> {
    if (stakeholderDto.length === 0) return;

    const stakeholders: Stakeholder[] = [];
    const departments: Department[] = [];
    for (const dto of stakeholderDto) {
      const existingStakeholder = await manager
        .getRepository(Stakeholder)
        .findOne({
          where: { projectId, code: parseInt(dto.stakeholderId) },
        });
      if (existingStakeholder) {
        stakeholders.push(existingStakeholder);
        await manager.getRepository(StakeholderDepartmentPosition).softDelete({
          stakeholder: existingStakeholder,
        });
        const department = await this.unsetStakeholderManager(
          manager,
          projectId,
          existingStakeholder,
        );
        if (department) departments.push(department);
      }
    }
    await manager.getRepository(Stakeholder).softRemove(stakeholders);
    await manager.getRepository(Department).save(departments);
  }

  async activate(
    token: string,
    projectId: string,
    stakeholderId: string,
  ): Promise<Stakeholder> {
    const stakeholder = await this.stakeholderRepo.findOne({
      where: { id: stakeholderId, projectId },
      relations: ['stakeholderUser'],
    });

    if (!stakeholder) {
      throw new NotFoundException('Stakeholder not found');
    }
    const userActivate: ActivateClientUserDto = {
      name: stakeholder.name,
      email: stakeholder.email,
      projectId: stakeholder.projectId,
    };
    try {
      await this.apiAuthService.activateUserStakeholders(token, userActivate);
      stakeholder.stakeholderUser.isUser = true;
      await this.stakeholderUserRepo.save(stakeholder.stakeholderUser);
      return await this.findOne(stakeholderId);
    } catch (error) {
      Logger.error(error, 'Error -> activate Stakeholder');
      throw new BadRequestException(error);
    }
  }

  async listAll(projectId: string): Promise<Stakeholder[]> {
    return await this.stakeholderRepo.find({
      select: ['id', 'code'],
      where: { projectId },
    });
  }

  async listSegmentation(dto: SegmentationDto): Promise<string[]> {
    const departments = await this.getDepartments(dto);
    const stakeholders = await this.getStakeholdersId(dto, departments);

    if (!stakeholders.length) {
      throw new NotFoundException('stakeholders not available');
    }

    const userIds = await this.retrieveUserIds(stakeholders);
    return userIds;
  }

  private async getStakeholdersId(
    dto: SegmentationDto,
    departments: string[],
  ): Promise<string[]> {
    const stakeholders: string[] = [];

    if (dto.allDepartmentStakeholders === true) {
      const stakeholdersExisting = await this.fetchStakeholders(
        dto,
        departments,
      );
      stakeholders.push(...stakeholdersExisting);
    } else if (dto.allInfluencerStakeholders === true) {
      const influencers = await this.fetchInfluencerStakeholders(
        dto,
        departments,
      );
      stakeholders.push(...influencers);
    } else if (dto.associatedInfluencers === true) {
      const influencers = await this.fetchInfluencerByProcess(
        dto,
        departments,
        dto.processes,
      );
      stakeholders.push(...influencers);
    }

    return stakeholders;
  }

  private async fetchStakeholders(
    dto: SegmentationDto,
    departments: string[],
  ): Promise<string[]> {
    const departmentStakeholders = await this.stakeholderRepo
      .createQueryBuilder('stakeholder')
      .leftJoinAndSelect('stakeholder.stakeholderDepartmentPositions', 'sdp')
      .select('stakeholder.email')
      .andWhere('stakeholder.projectId = :projectId', {
        projectId: dto.projectId,
      })
      .andWhere('sdp.department IN (:...departments)', {
        departments: departments,
      })
      .getMany();

    return departmentStakeholders.map((stakeholder) => stakeholder.email);
  }

  private async fetchInfluencerStakeholders(
    dto: SegmentationDto,
    departments: string[],
  ): Promise<string[]> {
    const influencersQueryBuilder = this.influencerRepo
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.stakeholder', 'stakeholder')
      .leftJoinAndSelect('stakeholder.stakeholderDepartmentPositions', 'sdp')
      .andWhere('influencer.projectId = :projectId', {
        projectId: dto.projectId,
      })
      .andWhere('sdp.department IN (:...departments)', {
        departments: departments,
      });

    if (dto.includingExcluded === false) {
      influencersQueryBuilder.andWhere('influencer.isExcluded');
    }

    const influencerStakeholders = await influencersQueryBuilder.getMany();
    return influencerStakeholders.map(
      (influencer) => influencer.stakeholder.email,
    );
  }

  private async fetchInfluencerByProcess(
    dto: SegmentationDto,
    departments: string[],
    processes: string[],
  ): Promise<string[]> {
    const influencersQueryBuilder = this.influencerRepo
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.stakeholder', 'stakeholder')
      .leftJoinAndSelect('stakeholder.stakeholderDepartmentPositions', 'sdp')
      .andWhere('influencer.projectId = :projectId', {
        projectId: dto.projectId,
      })
      .andWhere('sdp.department IN (:...departments)', {
        departments: departments,
      })
      .andWhere('influencer.selectedFutureProcess IN (:...processes)', {
        processes,
      });

    if (dto.includingExcluded === false) {
      influencersQueryBuilder.andWhere('influencer.isExcluded');
    }

    const influencerStakeholders = await influencersQueryBuilder.getMany();
    return influencerStakeholders.map(
      (influencer) => influencer.stakeholder.email,
    );
  }

  private async retrieveUserIds(stakeholders: string[]): Promise<string[]> {
    const users = await this.apiAuthService.getUserStakeholders(stakeholders);
    return users.map((user) => user.id);
  }

  private async getDepartments(dto: SegmentationDto) {
    const departments: string[] = [];
    if (dto.includeChildren) {
      const departmentsWithChildrenExisting = await this.getAllDepartmentIds(
        dto.projectId,
        dto.departments,
      );
      departmentsWithChildrenExisting.map((item) => departments.push(item));
    } else {
      const departmentsExisting = await this.departmentRepo.find({
        where: { id: In(dto.departments) },
      });
      departmentsExisting.map((item) => departments.push(item.id));
    }
    if (!departments.length) {
      throw new NotFoundException('Departments not found');
    }
    return departments;
  }

  async getAllDepartmentIds(
    projectId: string,
    departmentIds: string[],
  ): Promise<string[]> {
    const allDepartmentIds: string[] = [];

    const getChildrenIds = async (ids: string[]) => {
      for (const id of ids) {
        const department = await this.departmentRepo.findOne({
          where: { id, projectId },
          relations: ['children'],
        });
        if (department) allDepartmentIds.push(department.id);

        if (department?.children.length > 0) {
          const childrenIds = department.children.map((child) => child.id);
          await getChildrenIds(childrenIds);
        }
      }
    };

    await getChildrenIds(departmentIds);
    return allDepartmentIds;
  }

  async update(
    id: string,
    projectId: string,
    dto: StakeholderProjectDoleDto,
  ): Promise<Stakeholder> {
    const stakeholder = await this.stakeholderRepo.findOne({
      where: { id, projectId },
    });

    if (!stakeholder) {
      throw new NotFoundException('Stakeholder not found');
    }
    const projectRole = await this.projectRoleRepo.findOne({
      where: { id: dto.id },
    });
    if (!projectRole) {
      throw new NotFoundException('ProjectRole not found');
    }

    stakeholder.projectRole = projectRole;
    return await this.stakeholderRepo.save(stakeholder);
  }
}
