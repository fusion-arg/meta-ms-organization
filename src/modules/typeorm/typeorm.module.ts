import { DynamicModule, Module, Type } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'database/data-source';

@Module({
  imports: [NestTypeOrmModule.forRoot(dataSourceOptions)],
  exports: [NestTypeOrmModule],
})
export class TypeOrmModule {
  static forFeature(entities: Type<any>[]): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [NestTypeOrmModule.forFeature(entities)],
      exports: [NestTypeOrmModule.forFeature(entities)],
    };
  }
}
