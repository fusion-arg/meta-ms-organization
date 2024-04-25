import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/helpers/services/pagination.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Department } from './entities/department.entity';
import { DepartmentFilter } from '../../helpers/filters/department.filter';
import { DepartmentSorting } from '../../helpers/sortings/department.sorting';
import { Pagination } from '../../contracts/pagination.contract';
import { DepartmentDto, DepartmentFileDto } from './dto/department.dto';
import { UploadFileAction } from '../../enum/upload-file.enum';
import { DepartmentValidateService } from './department-validate.service';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadResponseDto } from '../upload-file/dto/file-upload-response.dto';

@Injectable()
export class DepartmentService extends PaginationService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @Inject(DepartmentValidateService)
    private deparmentValidateServide: DepartmentValidateService,
  ) {
    super();
  }

  async filter(
    projectId: string,
    filter: DepartmentFilter,
    sorting: DepartmentSorting,
    pagination: Pagination,
  ) {
    const queryBuilder = this.departmentRepo.createQueryBuilder('department');
    queryBuilder.leftJoinAndSelect('department.parent', 'parentDepartment');
    queryBuilder.leftJoinAndSelect('department.manager', 'manager');
    queryBuilder.andWhere('department.projectId = :projectId', { projectId });

    this.applyFilter(queryBuilder, filter);
    this.applySorting(queryBuilder, sorting);

    return await this.paginate(queryBuilder, pagination);
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepo
      .createQueryBuilder('department')
      .where('department.id = :id', { id })
      .leftJoinAndSelect('department.parent', 'parent')
      .leftJoinAndSelect('department.children', 'children')
      .leftJoinAndSelect('department.manager', 'manager')
      .getOne();

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Department>,
    sorting: DepartmentSorting,
  ): void {
    const { name, code, parent, updatedAt } = sorting;

    if (name) {
      queryBuilder.addOrderBy('department.name', name);
    }

    if (code) {
      queryBuilder.addOrderBy('department.code', code);
    }

    if (parent) {
      queryBuilder.addOrderBy('parentDepartment.name', parent);
    }

    if (updatedAt) {
      queryBuilder.addOrderBy('department.updatedAt', updatedAt);
    }
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<Department>,
    filter: DepartmentFilter,
  ): void {
    const { department, parentDepartment } = filter;

    if (department) {
      queryBuilder.andWhere(
        `department.name LIKE :departmentParam OR department.code LIKE :departmentParam`,
        { departmentParam: `%${department}%` },
      );
    }

    if (parentDepartment) {
      queryBuilder.andWhere(
        `parentDepartment.name LIKE :parentDepartmentParam OR parentDepartment.code LIKE :parentDepartmentParam`,
        { parentDepartmentParam: `%${parentDepartment}%` },
      );
    }
  }

  async processDepartments(
    projectId: string,
    departmentsFileDto: DepartmentFileDto,
  ): Promise<FileUploadResponseDto> {
    await this.deparmentValidateServide.validateDepartment(
      projectId,
      departmentsFileDto,
    );
    if (departmentsFileDto.hasErrors) {
      const errorsFileResponse = {
        message: departmentsFileDto.items.map(({ row, errors }) => ({
          row,
          errors,
        })),
      };
      throw new BadRequestException(errorsFileResponse);
    }

    const insertDepartments = departmentsFileDto.items.filter(
      (d) => d.action === UploadFileAction.add,
    ) as DepartmentDto[];
    const updateDepartments = departmentsFileDto.items.filter(
      (d) => d.action === UploadFileAction.update,
    ) as DepartmentDto[];
    const deleteDepartments = departmentsFileDto.items.filter(
      (d) => d.action === UploadFileAction.delete,
    ) as DepartmentDto[];

    await this.handleInserts(projectId, insertDepartments);
    await this.handleUpdates(projectId, updateDepartments);
    await this.handleDeletions(projectId, deleteDepartments);
    const responseDto: FileUploadResponseDto = {
      name: departmentsFileDto.file,
      additions: insertDepartments.length,
      updates: updateDepartments.length,
      deletions: deleteDepartments.length,
    };
    return responseDto;
  }

  async listByIds(ids: Array<string>): Promise<Department[]> {
    const departments = await this.departmentRepo
      .createQueryBuilder('department')
      .whereInIds(ids)
      .leftJoinAndSelect('department.parent', 'parent')
      .leftJoinAndSelect('department.children', 'children')
      .leftJoinAndSelect('department.manager', 'manager')
      .getMany();

    return departments;
  }

  private async handleInserts(
    projectId: string,
    departmentsDto: DepartmentDto[],
  ): Promise<void> {
    if (departmentsDto.length === 0) return;

    const departments: Department[] = [];
    for (const dto of departmentsDto) {
      const department = this.departmentRepo.create({
        id: uuidv4(),
        code: parseInt(dto.code),
        name: dto.name,
        parent: null,
        projectId,
      });
      departments.push(department);
    }
    await this.departmentRepo.save(departments);
    const departmetsWithParent = departmentsDto.filter(
      (item) => item.parent !== null,
    );
    if (departmetsWithParent) {
      await this.handleUpdates(projectId, departmetsWithParent);
    }
  }

  private async handleUpdates(
    projectId: string,
    departmentsDto: DepartmentDto[],
  ): Promise<void> {
    if (departmentsDto.length === 0) return;
    const departments: Department[] = [];
    for (const dto of departmentsDto) {
      const existingDepartment = await this.departmentRepo.findOne({
        where: { projectId, code: parseInt(dto.code) },
      });
      if (existingDepartment) {
        let parent = null;
        if (dto.parent !== null) {
          parent = await this.getParentByCode(projectId, dto);
        }
        existingDepartment.name = dto.name;
        existingDepartment.parent = parent;
        departments.push(existingDepartment);
      }
    }
    await this.departmentRepo.save(departments);
  }

  private async getParentByCode(projectId: string, dto: DepartmentDto) {
    return await this.departmentRepo.findOne({
      where: { projectId, code: parseInt(dto.parent) },
    });
  }

  private async handleDeletions(
    projectId: string,
    departmentsDto: DepartmentDto[],
  ): Promise<Department[]> {
    if (departmentsDto.length === 0) return;

    const departments: Department[] = [];
    for (const dto of departmentsDto) {
      const existingDepartment = await this.departmentRepo.findOne({
        where: { projectId, code: parseInt(dto.code) },
      });
      if (existingDepartment) departments.push(existingDepartment);
    }

    return this.departmentRepo.softRemove(departments);
  }

  async listAll(projectId: string): Promise<Department[]> {
    return await this.departmentRepo.find({
      where: { projectId },
    });
  }
}
