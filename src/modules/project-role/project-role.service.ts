import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRole } from './entities/proyect-role.entity';

@Injectable()
export class ProjectRoleService {
  constructor(
    @InjectRepository(ProjectRole)
    private projectRoleRepository: Repository<ProjectRole>,
  ) {}

  async list() {
    const projectRoles = await this.projectRoleRepository
      .createQueryBuilder('projectRole')
      .orderBy('projectRole.name', 'ASC')
      .getMany();

    return projectRoles;
  }
}
