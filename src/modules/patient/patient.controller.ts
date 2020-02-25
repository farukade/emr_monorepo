import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './patient.entity';
import { PatientDto } from './dto/patient.dto';

@Controller('patient')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @Get('list')
    listAllPatients(): Promise<Patient[]> {
        return this.patientService.listAllPatients();
    }

    @Get('find')
    findPatientRecord(
        @Query('query') query: string,
    ): Promise<Patient[]> {
        return this.patientService.findPatient(query);
    }

    @Post('save')
    saveNewPatient(@Body() patientDto: PatientDto) {
        return this.patientService.saveNewPatient(patientDto);
    }

    @Patch(':id/update')
    updatePatient(
        @Param('id') id: string,
        @Body() patientDto: PatientDto) {
        return this.patientService.updatePatientRecord(id, patientDto);
    }

    @Delete(':id')
    deletePatient(
        @Param('id') id: string,
    ): Promise<void> {
        return this.patientService.deletePatient(id);
    }

}
