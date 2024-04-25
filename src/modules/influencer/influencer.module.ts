import { Module } from '@nestjs/common';
import { InfluencerService } from './influencer.service';
import { ApiServiceModule } from '../../api-service/api-service.module';
import { TypeOrmModule } from '../typeorm/typeorm.module';
import { Influence } from './entities/influence.entity';
import { Influencer } from './entities/influencer.entity';
import { InfluencerValidateFileService } from './influencer-validate-file.service';
import { InfluencerUploadFileService } from './influencer-upload-file.service';
import { Stakeholder } from '../stakeholder/entities/stakeholder.entity';
import { InfluencerController } from './influencer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Influencer, Influence, Stakeholder]),
    ApiServiceModule,
  ],
  controllers: [InfluencerController],
  providers: [
    InfluencerService,
    InfluencerValidateFileService,
    InfluencerUploadFileService,
  ],
  exports: [InfluencerService, InfluencerUploadFileService],
})
export class InfluencerModule {}
