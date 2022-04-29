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

	const config = new DocumentBuilder().setTitle('EMR Backend API').setDescription('EMR Backend API').setVersion('1.0').build();
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

	app.use('/public', express.static(join(__dirname, '..', 'public')));

	await app.listen(process.env.PORT || 3002);

	console.info(`EMRAPP API running on 3002`);
}

bootstrap();
