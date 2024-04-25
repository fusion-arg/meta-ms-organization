import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PositionService } from './position.service';
import { Pagination } from '../../contracts/pagination.contract';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { PositionFilter } from '../../helpers/filters/position.filter';
import { PositionSorting } from '../../helpers/sortings/position.sorting';
import { PositionListSerializer } from '../../serializers/position-list.serializer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PositionFileDto } from './dto/position.dto';
import { PositionUploadFileService } from './positions-upload-file.service';
import { UploadFileSerializer } from '../../serializers/upload-file.serializer';

@Controller('projects/:projectId/positions')
export class PositionController {
  constructor(
    private positions: PositionService,
    private positionsUploadFileService: PositionUploadFileService,
  ) {}

  @Get()
  @UseGuards(new PermissionsGuard(['positions.list', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('projectId') projectId: string,
    @FilterParams(PositionFilter) filter: PositionFilter,
    @SortingParams(PositionSorting) sorting: PositionSorting,
    @PaginationParams() paginationParams: Pagination,
  ) {
    const { items, pagination } = await this.positions.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );
    const serializer = new PositionListSerializer();

    return serializer.respondMany(items, pagination);
  }

  @Post()
  @UseGuards(new PermissionsGuard(['positions.upload']))
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadCsvFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const positions: PositionFileDto =
      await this.positionsUploadFileService.processPositionsFile(file);

    const response = await this.positions.processPositions(
      projectId,
      positions,
    );
    const serializer = new UploadFileSerializer();

    return serializer.respond(response);
  }
}
