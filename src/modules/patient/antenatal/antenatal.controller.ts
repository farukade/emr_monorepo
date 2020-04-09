import { Controller, Post, Body, Param, Request } from '@nestjs/common';
import { AntenatalService } from './antenatal.service';
import { EnrollmentDto } from './dto/enrollment.dto';

@Controller('patient/antenatal')
export class AntenatalController {
    constructor(
        private antenatalService: AntenatalService,
    ) {}

    @Post('/save')
    saveNewEnrollment(
        @Body() createDto: EnrollmentDto,
        @Request() req,
    ) {
        return this.antenatalService.saveEnrollment(createDto, req.user.username);
    }
}
