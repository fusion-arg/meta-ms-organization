import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SprintService } from './sprint.service';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { Pagination } from '../../contracts/pagination.contract';
import { SprintSerializer } from '../../serializers/sprint.serializer';
import { SprintFilter } from '../../helpers/filters/sprint.filter';
import { SprintSorting } from '../../helpers/sortings/sprint.sorting';
import { SprintDto } from './dto/sprint.dto';
import { SprintRecommendedSerializer } from '../../serializers/sprint-recommended.serializer';

@Controller('projects/:projectId/sprints')
export class SprintController {
  constructor(private sprints: SprintService) {}

  @Get()
  @UseGuards(new PermissionsGuard(['sprints.list', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('projectId') projectId: string,
    @FilterParams(SprintFilter) filter: SprintFilter,
    @SortingParams(SprintSorting) sorting: SprintSorting,
    @PaginationParams() paginationParams: Pagination,
  ) {
    const { items, pagination } = await this.sprints.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );
    const serializer = new SprintSerializer();

    return serializer.respondMany(items, pagination);
  }

  @Get('recommended')
  @UseGuards(new PermissionsGuard(['sprints.list', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async findRecommended(@Param('projectId') projectId: string) {
    const item = await this.sprints.findRecommendedSprint(projectId);
    const serializer = new SprintRecommendedSerializer();
    return serializer.respond(item);
  }

  @Get(':id')
  @UseGuards(new PermissionsGuard(['sprints.view', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.sprints.findOne(id);
    const serializer = new SprintSerializer();

    return serializer.respond(item);
  }

  @Post()
  @UseGuards(new PermissionsGuard(['sprints.create']))
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('projectId') projectId: string, @Body() body: SprintDto) {
    const item = await this.sprints.create(body, projectId);
    const serializer = new SprintSerializer();

    return serializer.respond(item);
  }

  @Put(':id')
  @UseGuards(new PermissionsGuard(['sprints.update']))
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: SprintDto,
  ) {
    const item = await this.sprints.update(id, body, projectId);
    const serializer = new SprintSerializer();

    return serializer.respond(item);
  }

  @Delete(':id')
  @UseGuards(new PermissionsGuard(['sprints.delete']))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.sprints.remove(id);
  }
}
