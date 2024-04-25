import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InternalServerErrorFilter } from './filters/internal-server-error.filter';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { authMiddleware } from './middlewares/auth.middleware';
import { HttpService } from '@nestjs/axios';

config();

const applyFilters = (app: INestApplication<any>) => {
  app.useGlobalFilters(new InternalServerErrorFilter());
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  applyFilters(app);

  const httpService = app.get(HttpService);
  const configService = app.get(ConfigService);

  app.use(authMiddleware(httpService, configService));

  const config = new DocumentBuilder()
    .setTitle('Meta API NestJS')
    .setDescription('Meta Organization API NestJS')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(configService.get('APP_PORT') || 3000);
}

bootstrap();
