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

    @Get('reg')
    @Render('mail/reg')
    reg() {
        return { name: 'Reina Puiq', 
        date:'12-09-2021', folderNumber:'67923782'};
    }

    @Get('pharmacy')
    @Render('mail/pharmacy')
    pharmacy() {
        return { name: 'Reina Puiq', 
        date:'12-09-2021', folderNumber:'67923782', total:89023.32, drugs:[{name:'Clamodia', amount:'3450.28', prescription:'2-2'}, {name:'Primora', amount:'2200.28', prescription:'1-1-1'}]};
    }

    @Get('discharge')
    @Render('mail/discharge')
    discharge() {
        return { name: 'Reina Puiq', 
        date:'12-09-2021', folderNumber:'67923782', total:89023.32, services:[{name:'Clamodia', amount:'3450.28'}, {name:'Consultation', amount:'2200.28'}]};
    }
}
