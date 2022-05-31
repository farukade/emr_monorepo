import { Module } from '@nestjs/common';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';
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
        dir: join(__dirname, '../mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    BullModule.registerQueue({
      name: process.env.QUEUE_NAME,
    }),
    TypeOrmModule.forFeature([LoggerRepository]),
  ],
  providers: [QueueProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
