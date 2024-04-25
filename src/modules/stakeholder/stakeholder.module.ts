import { TypeOrmModule } from '@nestjs/typeorm';
import { Stakeholder } from './entities/stakeholder.entity';
import { StakeholderDepartmentPosition } from './entities/stakeholder-department-position.entity';
import { StakeholderController } from './stakeholder.controller';
import { StakeholderService } from './stakeholder.service';
import { Module } from '@nestjs/common';
import { StakeholderUploadFileService } from './stakeholder-upload-file.service';
import { StakeholderValidateService } from './stakeholder-validate.service';
import { ValidateFileService } from '../upload-file/validate-file.service';
import { Position } from '../position/entities/position.entity';
import { Department } from '../department/entities/department.entity';
import { ApiServiceModule } from '../../api-service/api-service.module';
import { StakeholderUser } from './entities/stakeholder-user.entity';
import { Influencer } from '../influencer/entities/influencer.entity';
import { ProjectRole } from '../project-role/entities/proyect-role.entity';

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
    ]),
    ApiServiceModule,
  ],
  controllers: [StakeholderController],
  providers: [
    StakeholderService,
    StakeholderUploadFileService,
    StakeholderValidateService,
    ValidateFileService,
  ],
})
export class StakeholderModule {}
