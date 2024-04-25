import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { StakeholderModule } from '../stakeholder/stakeholder.module';
import { StakeholderService } from '../stakeholder/stakeholder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../department/entities/department.entity';
import { Influencer } from '../influencer/entities/influencer.entity';
import { Position } from '../position/entities/position.entity';
import { StakeholderDepartmentPosition } from '../stakeholder/entities/stakeholder-department-position.entity';
import { StakeholderUser } from '../stakeholder/entities/stakeholder-user.entity';
import { Stakeholder } from '../stakeholder/entities/stakeholder.entity';
import { StakeholderUploadFileService } from '../stakeholder/stakeholder-upload-file.service';
import { StakeholderValidateService } from '../stakeholder/stakeholder-validate.service';
import { ValidateFileService } from '../upload-file/validate-file.service';
import { ApiServiceModule } from '../../api-service/api-service.module';
import { PublicService } from './public.service';
import { ProjectRole } from '../project-role/entities/proyect-role.entity';
import { SprintService } from '../sprint/sprint.service';
import { Sprint } from '../sprint/entities/sprint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Stakeholder,
      StakeholderDepartmentPosition,
      StakeholderUser,
      Position,
      Department,
      Influencer,
      ProjectRole,
      Sprint,
    ]),
    StakeholderModule,
    ApiServiceModule,
  ],
  controllers: [PublicController],
  providers: [
    StakeholderUploadFileService,
    StakeholderValidateService,
    ValidateFileService,
    StakeholderService,
    SprintService,
    PublicService,
  ],
})
export class PublicModule {}
