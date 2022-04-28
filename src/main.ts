import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { runInCluster } from './common/utils/runInCluster';

// tslint:disable-next-line:no-var-requires
require('events').EventEmitter.defaultMaxListeners = 50;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

    app.use('/uploads/avatars', express.static(join(__dirname, '..', 'uploads/avatars')));
    app.use('/uploads/docs', express.static(join(__dirname, '..', 'uploads/docs')));
    app.use('/public', express.static(join(__dirname, '..', 'public')));

    await app.listen(process.env.PORT || 3002);

    console.info(`EMRAPP API running on 3002`);

}

runInCluster(bootstrap);
