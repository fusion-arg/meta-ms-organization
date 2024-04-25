import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { InternalApiService } from './internal-api.service';

@Controller('internal-apis')
export class InternalApiController {
  constructor(private readonly internalApis: InternalApiService) {}

  @Get('projects/:projectId/mappers-for-process-capturing')
  @HttpCode(HttpStatus.OK)
  async getMappers(@Param('projectId') projectId: string) {
    return await this.internalApis.getMappers(projectId);
  }
}
