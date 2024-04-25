import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { Module } from '@nestjs/common';
import { PositionUploadFileService } from './positions-upload-file.service';
import { PositionsValidateService } from './positions-validate.service';
import { ValidateFileService } from '../upload-file/validate-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Position])],
  controllers: [PositionController],
  providers: [
    PositionService,
    PositionUploadFileService,
    PositionsValidateService,
    ValidateFileService,
  ],
})
export class PositionModule {}
