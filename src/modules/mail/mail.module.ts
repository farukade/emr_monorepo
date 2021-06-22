import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './mail.processor';

console.log(join(__dirname, './template'));

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
            useFactory: () => ({
                redis: {
                    host: 'localhost',
                    port: 6379,
                },
            }),
        }),
    ],
    providers: [MailService, MailProcessor],
    exports: [MailService],
})

export class MailModule {
}
