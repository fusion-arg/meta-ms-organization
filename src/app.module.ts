import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CommandModule } from './commands/command.module';
import { TypeOrmModule } from './modules/typeorm/typeorm.module';
import { HttpModule } from '@nestjs/axios';
import { DepartmentModule } from './modules/department/department.module';
import { ProjectAclMiddleware } from './middlewares/project-acl.middleware';
import { StakeholderModule } from './modules/stakeholder/stakeholder.module';
import { PositionModule } from './modules/position/position.module';
import { SprintModule } from './modules/sprint/sprint.module';
import { ApiServiceModule } from './api-service/api-service.module';
import { InfluencerModule } from './modules/influencer/influencer.module';
import { InfluencesModule } from './modules/influence/influences.module';
import { PublicModule } from './modules/public/public.module';
import { ProjectRoleModule } from './modules/project-role/project-role.module';
import { InternalApiModule } from 'src/modules/internal-api/internal-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule,
    DepartmentModule,
    StakeholderModule,
    PositionModule,
    SprintModule,
    CommandModule,
    HttpModule,
    ApiServiceModule,
    InfluencerModule,
    InfluencesModule,
    PublicModule,
    ProjectRoleModule,
    InternalApiModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        always: true,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProjectAclMiddleware).forRoutes('projects/:projectId*');
  }
}
