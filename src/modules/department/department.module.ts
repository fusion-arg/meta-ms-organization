import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../typeorm/typeorm.module';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department } from './entities/department.entity';
import { DepartmentUploadFileService } from './department-upload-file.service';
import { DepartmentValidateService } from './department-validate.service';
import { ValidateFileService } from '../upload-file/validate-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [DepartmentController],
  providers: [
    DepartmentService,
    DepartmentUploadFileService,
    DepartmentValidateService,
    ValidateFileService,
  ],
})
export class DepartmentModule {}
