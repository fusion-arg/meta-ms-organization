import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProjectRoleService } from './project-role.service';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { ProjectRoleSerializer } from '../../serializers/project-roles.serializer';

@Controller('project-roles')
export class ProjectRoleController {
  constructor(private projectRoleService: ProjectRoleService) {}

  @Get()
  @UseGuards(
    new PermissionsGuard(['project-roles.list', 'client-users.default']),
  )
  @HttpCode(HttpStatus.OK)
  async list() {
    const items = await this.projectRoleService.list();
    const serializer = new ProjectRoleSerializer();

    return serializer.respondMany(items);
  }
}
