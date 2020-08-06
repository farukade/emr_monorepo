import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {join} from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };
  app.enableCors(corsOption);
  app.use('/uploads/avatars', express.static(join(__dirname, '..', 'uploads/avatars'))); // <-
  await app.listen(process.env.PORT || 3002);

  console.info(`EMRAPP API running on 3002`);

}
bootstrap();
