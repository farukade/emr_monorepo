import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './patient.entity';
import { PatientDto } from './dto/patient.dto';

@Controller('patient')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @Get('list-patients')
    listAllPatients(): Promise<Patient[]> {
        return this.patientService.listAllPatients();
    }

    @Post('save')
    saveNewPatient(@Body() patientDto: PatientDto) {
        return this.patientService.saveNewPatient(patientDto);
    }

    @Patch(':id/update')
    updatePatient(@Body() patientDto: PatientDto) {
        
    }

}
