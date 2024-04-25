import { Module } from '@nestjs/common';
import { InfluencesController } from './influences.controller';

@Module({
  controllers: [InfluencesController],
})
export class InfluencesModule {}
