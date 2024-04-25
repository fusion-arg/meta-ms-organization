import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileSerializer } from '../../serializers/upload-file.serializer';
import { InfluencerDto } from './dto/influencer.dto';
import { InfluencerService } from './influencer.service';
import { InfluencerUploadFileService } from './influencer-upload-file.service';
import { InfluencerFilter } from '../../helpers/filters/influencer.filter';
import { InfluencerSorting } from '../../helpers/sortings/influencer.sorting';
import { Pagination } from '../../contracts/pagination.contract';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { InfluencerListSerializer } from '../../serializers/influencer-list.serializer';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { InfluencerDetailSerializer } from '../../serializers/influencer-detail.serializer';
import { InfluencerUpdate } from './dto/influencer-update.dto';

@Controller('projects/:projectId/influencers')
export class InfluencerController {
  constructor(
    private influencerUploadFileService: InfluencerUploadFileService,
    private influencerService: InfluencerService,
  ) {}

  @Post()
  @UseGuards(new PermissionsGuard(['influencers.upload']))
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadInfluencerCsvFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    const id = req.body.processId;
    const influencerDto: InfluencerDto =
      await this.influencerUploadFileService.processFile(file);

    const response = await this.influencerService.influencerCreate(
      token,
      projectId,
      id,
      influencerDto,
    );

    const serializer = new UploadFileSerializer();

    return serializer.respond(response);
  }

  @Get()
  @UseGuards(new PermissionsGuard(['influencers.list', 'client-users.default']))
  async list(
    @Param('projectId') projectId: string,
    @FilterParams(InfluencerFilter) filter: InfluencerFilter,
    @SortingParams(InfluencerSorting) sorting: InfluencerSorting,
    @PaginationParams() paginationParams: Pagination,
  ) {
    const { items, pagination } = await this.influencerService.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );
    const serializer = new InfluencerListSerializer();

    return serializer.respondMany(items, pagination);
  }

  @Get(':id')
  @UseGuards(new PermissionsGuard(['influencers.view', 'client-users.default']))
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const item = await this.influencerService.findOne(projectId, id);
    const serializer = new InfluencerDetailSerializer();

    return serializer.respond(item);
  }

  @Put(':id')
  @UseGuards(new PermissionsGuard(['influencers.update']))
  async updateProcessInfluences(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: InfluencerUpdate,
  ) {
    const item = await this.influencerService.updateProcessInfluences(
      projectId,
      id,
      dto,
    );
    const serializer = new InfluencerDetailSerializer();

    return serializer.respond(item);
  }
}
