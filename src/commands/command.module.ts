import { Module } from '@nestjs/common';
import { commands } from './commands';
import { TypeOrmModule } from 'src/modules/typeorm/typeorm.module';

@Module({
  imports: [TypeOrmModule],
  providers: [...commands],
  exports: [...commands],
})
export class CommandModule {}
