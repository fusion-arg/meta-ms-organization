import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRoleController } from './project-role.controller';
import { ProjectRoleService } from './project-role.service';
import { Module } from '@nestjs/common';
import { ProjectRole } from './entities/proyect-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectRole])],
  controllers: [ProjectRoleController],
  providers: [ProjectRoleService],
})
export class ProjectRoleModule {}
