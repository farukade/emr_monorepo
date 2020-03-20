import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { PatientAntenatalDto } from './dto/patient.antenatal.dto';
import { PatientAllergyDto } from './dto/patient.allergy.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { PatientAntenatal } from './entities/patient_antenatal.entity';
import { PatientAllergy } from './entities/patient_allergies.entity';

@Controller('patient')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @Get('list')
    listAllPatients(): Promise<Patient[]> {
        return this.patientService.listAllPatients();
    }

    @Get('find')
    findPatientRecord(
        @Query('q') q: string,
    ): Promise<Patient[]> {
        return this.patientService.findPatient(q);
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

    @Post('check-payment-status')
    checkPaymentStatus(
        @Body() param,
    ) {
        return this.patientService.checkPaymentStatus(param);
    }

    @Get(':id/vitals')
    getVitals(
        @Param('id') id: string,
    ): Promise <PatientVital[]> {
        return this.patientService.getVitals(id);
    }

    @Post('save-vitals')
    saveVitals(
        @Body() param,
    ) {
        return this.patientService.doSaveVitals(param);
    }

    @Get(':id/antenatals')
    getAntenatals(
        @Param('id') id: string,
    ): Promise <PatientAntenatal[]> {
        return this.patientService.getAntenatals(id);
    }

    @Post('save-antenatal')
    saveAntenatal(
        @Body() param: PatientAntenatalDto,
    ) {
        return this.patientService.doSaveAntenatal(param);
    }

    @Get(':id/antenatals')
    getAllergies(
        @Param('id') id: string,
    ): Promise <PatientAllergy[]> {
        return this.patientService.getAllergies(id);
    }

    @Post('save-allergies')
    saveAllergies(
        @Body() param: PatientAllergyDto,
    ) {
        return this.patientService.doSaveAllergies(param);
    }

}
