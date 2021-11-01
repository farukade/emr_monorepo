import { Controller, Get, Render } from '@nestjs/common';
import { MailService } from './modules/mail/mail.service';

@Controller()
export class AppController {
    constructor(private mailService: MailService) {
    }

    @Get('lab-result')
    @Render('lab-result')
    async labResult() {
        try {
            const mail = {
                id: 1,
                name: 'Chukwuemeka Ihedoro',
                email: 'caihedoro@gmail.com',
                phoneNumber: '08063352837',
                createdAt: '2021-10-04 12:43:12',
                message: 'welcome to deda',
            };
            await this.mailService.sendMail(mail, 'registration');
        } catch (e) {
            console.log(e);
        }

        return { message: 'Hello world!' };
    }

    @Get('regimen')
    @Render('regimen-prescription')
    regimen() {
        return { message: 'Hello world!' };
    }
}
