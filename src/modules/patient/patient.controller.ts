import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { PatientAntenatalDto } from './dto/patient.antenatal.dto';
import { PatientAllergyDto } from './dto/patient.allergy.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { PatientAntenatal } from './entities/patient_antenatal.entity';
import { PatientAllergy } from './entities/patient_allergies.entity';
import { PatientRequest } from './entities/patient_requests.entity';
import { Voucher } from '../finance/vouchers/voucher.entity';

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

    @Get(':id/vouchers')
    getVouchers(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <Voucher[]> {
        return this.patientService.getVouchers(id, urlParams);
    }


    @Get(':id/vitals')
    getVitals(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <PatientVital[]> {
        return this.patientService.getVitals(id, urlParams);
    }

    @Post('save-vitals')
    saveVitals(
        @Body() param,
    ) {
        return this.patientService.doSaveVitals(param);
    }

    @Patch(':vitalId/update-vital')
    updateVital(
        @Param('vitalId') vitalId: string,
        @Body() param,
    ) {
        return this.patientService.doUpdateVital(vitalId, param);
    }

    @Delete(':vitalId/delete-vital')
    deletePatientVital(
        @Param('vitalId') vitalId: string,
    ) {
        return this.patientService.deleteVital(vitalId);
    }

    @Get(':id/antenatals')
    getAntenatals(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <PatientAntenatal[]> {
        return this.patientService.getAntenatals(id, urlParams);
    }

    @Post('save-antenatal')
    saveAntenatal(
        @Body() param: PatientAntenatalDto,
    ) {
        return this.patientService.doSaveAntenatal(param);
    }

    @Patch(':antenatalId/update-antenatal')
    updateAntenatal(
        @Param('antenatalId') antenatalId: string,
        @Body() param: PatientAntenatalDto,
    ) {
        return this.patientService.doUpdateAntenatal(antenatalId, param);
    }

    @Delete(':antenatalId/delete-antenatal')
    deletePatientAntenatal(
        @Param('antenatalId') antenatalId: string,
    ) {
        return this.patientService.deleteAntenatal(antenatalId);
    }

    @Get(':id/allergies')
    getAllergies(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <PatientAllergy[]> {
        return this.patientService.getAllergies(id, urlParams);
    }

    @Post('save-allergies')
    saveAllergies(
        @Body() param: PatientAllergyDto,
    ) {
        return this.patientService.doSaveAllergies(param);
    }

    @Patch(':allergyId/update-allergy')
    updateAllergy(
        @Param('allergyId') allergyId: string,
        @Body() param: PatientAllergyDto,
    ) {
        return this.patientService.doUpdateAllergy(allergyId, param);
    }

    @Delete(':allergyId/delete-allergy')
    deletePatientAllergy(
        @Param('allergyId') allergyId: string,
    ) {
        return this.patientService.deleteAllergy(allergyId);
    }

    @Post('save-request')
    saveRequest(
        @Body() param,
    ) {
        return this.patientService.doSaveRequest(param);
    }

    @Get(':patientId/request/:requestType')
    getRequests(
        @Param('patientId') id: string,
        @Param('requestType') requestType: string,
        @Query() urlParams,
    ): Promise <PatientRequest[]> {
        return this.patientService.doListRequest(requestType, id, urlParams);
    }

    @Delete(':requestId/delete-request')
    deletePatientRequest(
        @Param('requestId') requestId: string,
    ) {
        return this.patientService.deleteRequest(requestId);
    }

}
