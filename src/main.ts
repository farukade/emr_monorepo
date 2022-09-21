import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('events').EventEmitter.defaultMaxListeners = 50;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('EMR Backend API')
    .setDescription('EMR Backend API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.use(compression());

  const corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };
  app.enableCors(corsOption);

  app.use('/documents', express.static(join(__dirname, '..', 'public/documents')));
  app.use('/downloads', express.static(join(__dirname, '..', 'public/downloads')));
  app.use('/images', express.static(join(__dirname, '..', 'public/images')));
  app.use('/outputs', express.static(join(__dirname, '..', 'public/outputs')));

  const port = process.env.PORT || 3002;

  await app.listen(port, async () => {
    console.info(`EMRAPP API running on: ${await app.getUrl()}`);
  });
}

bootstrap();
