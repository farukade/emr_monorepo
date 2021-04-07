import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
    @Get('lab-result')
    @Render('lab-result')
    labResult() {
        return { message: 'Hello world!' };
    }

    @Get('regimen')
    @Render('regimen-prescription')
    regimen() {
        return { message: 'Hello world!' };
    }

    @Get('invoice')
    @Render('mail/invoice')
    invoice() {
        return { name: 'Patient Name', 
        address:'#34 Goas H as ahhsjsa ashashjas', date:'12-09-2021', total: 7829382.00, email:'nsdsnaikasoh@hajshjas.shajsh'};
    }
}
