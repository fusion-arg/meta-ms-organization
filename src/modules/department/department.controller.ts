import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { Pagination } from '../../contracts/pagination.contract';
import { DepartmentListSerializer } from '../../serializers/department-list.serializer';
import { DepartmentFilter } from '../../helpers/filters/department.filter';
import { DepartmentSorting } from '../../helpers/sortings/department.sorting';
import { DepartmentDetailSerializer } from '../../serializers/department-detail.serializer';
import { FileInterceptor } from '@nestjs/platform-express';
import { DepartmentUploadFileService } from './department-upload-file.service';
import { DepartmentFileDto } from './dto/department.dto';
import { UploadFileSerializer } from '../../serializers/upload-file.serializer';
import { PermissionsGuard } from '../../guards/permissions.guard';

@Controller('projects/:projectId/departments')
export class DepartmentController {
  constructor(
    private departments: DepartmentService,
    private departmentUploadFileService: DepartmentUploadFileService,
  ) {}

  @Get()
  @UseGuards(new PermissionsGuard(['departments.list', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('projectId') projectId: string,
    @FilterParams(DepartmentFilter) filter: DepartmentFilter,
    @SortingParams(DepartmentSorting) sorting: DepartmentSorting,
    @PaginationParams() paginationParams: Pagination,
  ) {
    const { items, pagination } = await this.departments.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );
    const serializer = new DepartmentListSerializer();

    return serializer.respondMany(items, pagination);
  }

  @Get('list-all')
  async listAllDepartments(@Param('projectId') projectId: string) {
    const items = await this.departments.listAll(projectId);
    const serializer = new DepartmentDetailSerializer();
    return serializer.respondMany(items);
  }

  @Get('list-by-ids')
  async listByIds(@Query() data: any) {
    const item = await this.departments.listByIds(data.departmentIds);
    const serializer = new DepartmentDetailSerializer();

    return serializer.respondMany(item);
  }

  @Get(':id')
  @UseGuards(new PermissionsGuard(['departments.view', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.departments.findOne(id);
    const serializer = new DepartmentDetailSerializer();

    return serializer.respond(item);
  }

  @Post()
  @UseGuards(new PermissionsGuard(['departments.upload']))
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadCsvFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const departments: DepartmentFileDto =
      await this.departmentUploadFileService.processDepartmentsFile(file);
    const response = await this.departments.processDepartments(
      projectId,
      departments,
    );
    const serializer = new UploadFileSerializer();

    return serializer.respond(response);
  }
}
