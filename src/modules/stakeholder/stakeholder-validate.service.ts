import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { ValidateFileService } from '../upload-file/validate-file.service';
import { Stakeholder } from './entities/stakeholder.entity';
import { StakeholderDto, StakeholderFileDto } from './dto/stakeholder.dto';
import { isNumber } from '../../utils/validate';
import { Position } from '../position/entities/position.entity';
import { Department } from '../department/entities/department.entity';
import { ProjectRole } from '../project-role/entities/proyect-role.entity';

@Injectable()
export class StakeholderValidateService {
  constructor(
    @InjectRepository(Stakeholder)
    private stakeholderRepository: Repository<Stakeholder>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(ProjectRole)
    private projectRoleRepository: Repository<ProjectRole>,
    @Inject(ValidateFileService)
    private validateFileService: ValidateFileService,
  ) {}

  async validateStakeholder(projectId: string, fileDto: StakeholderFileDto) {
    await this.validateFileService.validateStakeholderFile(fileDto);
    for (const item of fileDto.items) {
      await this.validateItems(projectId, item as StakeholderDto);
    }
    await this.validateProjectRole(fileDto.items);
    if (fileDto.items.some((item) => item.errors.length > 0)) {
      fileDto.hasErrors = true;
    }
  }

  private async validateItems(projectId: string, item: StakeholderDto) {
    await this.validateEmail(projectId, item);
    await this.validateStakeholderId(projectId, item);
    await this.validateDepartmentAndPosition(projectId, item);
    await this.validateManager(projectId, item);
  }

  private async validateProjectRole(items: StakeholderDto[]) {
    const projectRole = await this.projectRoleRepository.find();
    for (const item of items) {
      if (item.action === UploadFileAction.delete) continue;
      if (item.projectRole === '') item.projectRole = 'End User';
      const matchedRole = projectRole.find(
        (role) => role.name === item.projectRole,
      );
      if (!matchedRole && item.projectRole) {
        item.errors.push(`Invalid column 'projectRole'`);
      } else {
        item.projectRoleId = matchedRole.id;
      }
    }
  }

  private async validateEmail(projectId: string, item: StakeholderDto) {
    const stakeholderByEmail = await this.stakeholderRepository.findOne({
      where: { projectId, email: item.email },
    });
    if (item.action === UploadFileAction.add && stakeholderByEmail) {
      item.errors.push(`Invalid column 'email', already exists in database.`);
    } else if (item.action !== UploadFileAction.add) {
      if (!stakeholderByEmail) {
        item.errors.push(
          `Invalid column 'email', cannot be found in database.`,
        );
      }
      if (
        stakeholderByEmail &&
        stakeholderByEmail.code !== parseInt(item.stakeholderId)
      ) {
        item.errors.push(
          `Invalid column 'email', stakeholderId does not correspond to the registered email.`,
        );
      }
    }
  }

  private async validateStakeholderId(projectId: string, item: StakeholderDto) {
    if (!isNumber(item.stakeholderId)) return;

    const stakeholderByCode = await this.stakeholderRepository.findOne({
      where: { projectId, code: parseInt(item.stakeholderId) },
    });

    if (item.action === UploadFileAction.add && stakeholderByCode) {
      item.errors.push(
        `Invalid column 'stakeholderId', already exists in database.`,
      );
    }
    if (
      (item.action === UploadFileAction.update ||
        item.action === UploadFileAction.delete) &&
      !stakeholderByCode
    ) {
      item.errors.push(
        `Invalid column 'stakeholderId', cannot be found in database.`,
      );
    }
  }

  private async validateDepartmentAndPosition(
    projectId: string,
    dto: StakeholderDto,
  ) {
    if (dto.action === UploadFileAction.delete) return;

    for (const item of dto.departmentsAndPositions) {
      const positions = await this.positionRepository.findOne({
        where: {
          projectId,
          externalId: In(item.positions),
        },
      });
      const department = await this.departmentRepository.findOne({
        where: {
          projectId,
          code: parseInt(item.department),
        },
      });

      if (!department) {
        dto.errors.push(
          `Invalid column 'department', cannot be found in database.`,
        );
      }
      if (!positions) {
        dto.errors.push(
          `Invalid column 'department', positions cannot be found in database.`,
        );
      }
    }
  }

  private async validateManager(projectId: string, item: StakeholderDto) {
    if (!isNumber(item.manager)) return;

    const department = await this.departmentRepository.findOne({
      where: { projectId, code: parseInt(item.manager) },
    });

    if (!department) {
      item.errors.push(
        `Invalid column 'manager', cannot be found departmentId in database.`,
      );
    }
  }
}
