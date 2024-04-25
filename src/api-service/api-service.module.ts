import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiProjectService } from './api-project.service';
import { ApiAuthService } from './api-auth.service';
import { ApiProcessService } from './api-process.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        timeout: 5000,
        maxRedirects: 5,
        headers: {
          'Response-Content-Type': 'json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ApiProjectService, ApiAuthService, ApiProcessService],
  exports: [ApiProjectService, ApiAuthService, ApiProcessService],
})
export class ApiServiceModule {}
