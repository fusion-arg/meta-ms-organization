import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { DepartmentDto, DepartmentFileDto } from './dto/department.dto';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { ValidateFileService } from '../upload-file/validate-file.service';
import { CountMap } from '../upload-file/dto/file.dto';
import { isNumber } from '../../utils/validate';

@Injectable()
export class DepartmentValidateService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @Inject(ValidateFileService)
    private validateFileService: ValidateFileService,
  ) {}

  async validateDepartment(
    projectId: string,
    departmentsFileDto: DepartmentFileDto,
  ) {
    await this.validateFileService.validateFile(departmentsFileDto);
    const countCodes = this.validateFileService.getCountMap(
      departmentsFileDto.codes,
    );
    for (const item of departmentsFileDto.items) {
      await this.validateItems(
        projectId,
        item as DepartmentDto,
        departmentsFileDto.items as DepartmentDto[],
        countCodes,
      );
    }
    if (departmentsFileDto.items.some((item) => item.errors.length > 0)) {
      departmentsFileDto.hasErrors = true;
    }
  }

  private async validateItems(
    projectId: string,
    item: DepartmentDto,
    departments: DepartmentDto[],
    countCodes: CountMap,
  ) {
    await this.validateName(projectId, item);
    await this.validateCode(projectId, item, departments);
    await this.validateParent(projectId, item, countCodes);
  }

  private async validateName(projectId: string, item: DepartmentDto) {
    const departmentByName = await this.departmentRepo.findOne({
      where: { projectId, name: item.name },
      relations: ['children'],
    });
    if (item.action === UploadFileAction.add && departmentByName) {
      item.errors.push(`Invalid column 'name', already exists in database.`);
    }
    if (
      item.action === UploadFileAction.update &&
      departmentByName &&
      departmentByName.code !== parseInt(item.code)
    ) {
      item.errors.push(
        `Invalid column 'name', already exists for another department in database.`,
      );
    }
  }

  private async validateCode(
    projectId: string,
    item: DepartmentDto,
    departments: DepartmentDto[],
  ) {
    if (!isNumber(item.code)) return;

    const departmentByCode = await this.departmentRepo.findOne({
      where: { projectId, code: parseInt(item.code) },
      relations: ['children'],
    });

    if (item.action === UploadFileAction.add && departmentByCode) {
      item.errors.push(`Invalid column 'code', already exists in database.`);
    }
    if (
      (item.action === UploadFileAction.update ||
        item.action === UploadFileAction.delete) &&
      !departmentByCode
    ) {
      item.errors.push(`Invalid column 'code', cannot be found in database.`);
    }
    if (item.action === UploadFileAction.delete && departmentByCode) {
      const childrenCodesEntity = departmentByCode.children.map(
        (item) => item.code,
      );
      let count = 0;
      for (const department of departments) {
        if (
          parseInt(department.parent) === parseInt(item.code) &&
          department.action !== UploadFileAction.delete
        ) {
          item.errors.push(
            `Invalid column 'code', cannot add or edit a child of a parent to be deleted`,
          );
          return;
        }
        if (
          childrenCodesEntity.includes(parseInt(department.code)) &&
          department.action === UploadFileAction.delete
        ) {
          count++;
        }
      }
      if (count !== childrenCodesEntity.length) {
        item.errors.push(
          `Invalid column 'code', all department children must be deleted too`,
        );
      }
    }
  }

  private async validateParent(
    projectId: string,
    item: DepartmentDto,
    countCodes: CountMap,
  ) {
    if (item.code === item.parent) {
      item.errors.push(`Invalid column 'parent', cannot be its own parent.`);
    }
    if (item.parent !== null && !isNumber(item.parent)) {
      item.errors.push(`Invalid column 'parent', must be numeric.`);
    }
    if (countCodes[item.parent] === undefined && isNumber(item.parent)) {
      const departmentParent = await this.departmentRepo.findOne({
        where: { projectId, code: parseInt(item.parent) },
      });

      if (
        (item.action === UploadFileAction.update ||
          item.action === UploadFileAction.add) &&
        !departmentParent
      ) {
        item.errors.push(
          `Invalid column 'parent', cannot be found in database.`,
        );
      }
    }
  }
}
