import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './mail.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerRepository } from '../logger/logger.repository';

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: process.env.MAILER_SMTP,
				port: process.env.MAILER_PORT,
				ignoreTLS: false,
				secure: false,
				auth: {
					user: process.env.MAIL_USER_NAME,
					pass: process.env.MAIL_USER_PASSWORD,
				},
			},
			defaults: {
				from: '"No Reply" <noreply@dedahospital.com>',
			},
			template: {
				dir: join(__dirname, './templates'),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
		}),
		BullModule.registerQueueAsync({
			name: process.env.MAIL_QUEUE_NAME,
			imports: [],
			useFactory: async () => ({
				name: process.env.MAIL_QUEUE_NAME,
				defaultJobOptions: {
					removeOnComplete: true,
				},
				redis: {
					host: process.env.REDIS_HOST,
					port: Number(process.env.REDIS_PORT),
				},
			}),
		}),
		TypeOrmModule.forFeature([LoggerRepository]),
	],
	providers: [MailService, MailProcessor],
	exports: [MailService],
})
export class MailModule {}
