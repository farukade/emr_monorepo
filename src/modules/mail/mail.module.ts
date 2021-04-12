import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: process.env.MAILER_SMTP,
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
                dir: join(__dirname, '../../../views/mail'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {
}
