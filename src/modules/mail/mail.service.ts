import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {
    }

    async sendInvoice(data: any) {

        await this.mailerService.sendMail({
            to: data.email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Deda Hospital Invoice',
            template: 'invoice',
            context: {
                name: data.name,
                total: data.total,
                address: data.address,
                invoiceNumber: data.invoiceNumber,
                email: data.email,
                date: data.date,
            },
        });
    }
}
