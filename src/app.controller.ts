import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
    @Get('lab-result')
    @Render('lab-result')
    labResult() {
        return { message: 'Hello world!' };
    }
}
