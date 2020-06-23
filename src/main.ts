import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };
  app.enableCors(corsOption);
  await app.listen(process.env.PORT || 3002);

  console.info(`EMRAPP API running on 3002`);

}
bootstrap();
