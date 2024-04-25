import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StakeholderService } from './stakeholder.service';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { Pagination } from '../../contracts/pagination.contract';
import { StakeholderFilter } from '../../helpers/filters/stakeholder.filter';
import { StakeholderSorting } from '../../helpers/sortings/stakeholder.sorting';
import { StakeholderListSerializer } from '../../serializers/stakeholder-list.serializer';
import { StakeholderDetailSerializer } from '../../serializers/stakeholder-detail.serializer';
import { StakeholderUploadFileService } from './stakeholder-upload-file.service';
import { StakeholderFileDto } from './dto/stakeholder.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileSerializer } from '../../serializers/upload-file.serializer';
import { StakeholderProjectDoleDto } from './dto/stakeholder-project-role.dto';
import { StakeholderSerializer } from '../../serializers/stakeholder.serializer';

@Controller('projects/:projectId/stakeholders')
export class StakeholderController {
  constructor(
    private stakeholders: StakeholderService,
    private uploadFileService: StakeholderUploadFileService,
  ) {}

  @Get()
  @UseGuards(
    new PermissionsGuard(['stakeholders.list', 'client-users.default']),
  )
  async list(
    @Param('projectId') projectId: string,
    @FilterParams(StakeholderFilter) filter: StakeholderFilter,
    @SortingParams(StakeholderSorting) sorting: StakeholderSorting,
    @PaginationParams() paginationParams: Pagination,
  ) {
    const { items, pagination } = await this.stakeholders.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );
    const serializer = new StakeholderListSerializer();

    return serializer.respondMany(items, pagination);
  }

  @Get('list-all')
  async listAllStakeholders(@Param('projectId') projectId: string) {
    return await this.stakeholders.listAll(projectId);
  }

  @Get(':id')
  @UseGuards(
    new PermissionsGuard(['stakeholders.view', 'client-users.default']),
  )
  async findOne(@Param('id') id: string) {
    const item = await this.stakeholders.findOne(id);
    const serializer = new StakeholderDetailSerializer();

    return serializer.respond(item);
  }

  @Patch(':id')
  @UseGuards(new PermissionsGuard(['project-roles.update']))
  async updateProjectRole(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: StakeholderProjectDoleDto,
  ) {
    const item = await this.stakeholders.update(id, projectId, body);
    const serializer = new StakeholderSerializer();
    return serializer.respond(item);
  }

  @Post()
  @UseGuards(new PermissionsGuard(['stakeholders.upload']))
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadCsvFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    const stakeholders: StakeholderFileDto =
      await this.uploadFileService.processStakeholdersFile(file);
    const response = await this.stakeholders.processStakeholdersFile(
      token,
      projectId,
      stakeholders,
    );

    const serializer = new UploadFileSerializer();

    return serializer.respond(response);
  }

  @Post(':stakeholderId/activate')
  @UseGuards(new PermissionsGuard(['stakeholders.activate-user']))
  @HttpCode(HttpStatus.OK)
  async activateUser(
    @Param('projectId') projectId: string,
    @Param('stakeholderId') stakeholderId: string,
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    const item = await this.stakeholders.activate(
      token,
      projectId,
      stakeholderId,
    );
    const serializer = new StakeholderDetailSerializer();

    return serializer.respond(item);
  }
}
