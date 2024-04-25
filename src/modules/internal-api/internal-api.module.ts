import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalApiController } from './internal-api.controller';
import { InternalApiService } from './internal-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [InternalApiController],
  providers: [InternalApiService],
})
export class InternalApiModule {}
