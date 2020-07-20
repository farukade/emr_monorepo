import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, Res, UploadedFiles, UseGuards, Request } from '@nestjs/common';
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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import fs = require('fs');
import { PatientDocument } from './entities/patient_documents.entity';
import { PatientRequestDocument } from './entities/patient_request_documents.entity';
import { AuthGuard } from '@nestjs/passport';
import { Immunization } from './entities/immunization.entity';
import { ImmunizationDto } from './dto/immunization.dto';

@UseGuards(AuthGuard('jwt'))
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
    @UsePipes(ValidationPipe)
    saveNewPatient(
        @Body() patientDto: PatientDto,
        @Request() req,
    ) {
        return this.patientService.saveNewPatient(patientDto, req.user.username);
    }

    @Patch(':id/update')
    @UsePipes(ValidationPipe)
    updatePatient(
        @Param('id') id: string,
        @Body() patientDto: PatientDto,
        @Request() req,
    ) {
        return this.patientService.updatePatientRecord(id, patientDto, req.user.username);
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

    @Get(':id/documents')
    getPatientDocument(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <PatientDocument[]> {
        return this.patientService.getDocuments(id, urlParams);
    }

    @Get(':requestId/request-document')
    getRequestDocument(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <PatientRequestDocument[]> {
        return this.patientService.getRequestDocuments(id, urlParams);
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
        @Request() req,
    ) {
        return this.patientService.doSaveVitals(param, req.user.username);
    }

    @Patch(':vitalId/update-vital')
    updateVital(
        @Param('vitalId') vitalId: string,
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doUpdateVital(vitalId, param, req.user.username);
    }

    @Delete(':vitalId/delete-vital')
    deletePatientVital(
        @Param('vitalId') vitalId: string,
    ) {
        return this.patientService.deleteVital(vitalId);
    }

    // @Get(':id/antenatals')
    // getAntenatals(
    //     @Param('id') id: string,
    //     @Query() urlParams,
    // ): Promise <PatientAntenatal[]> {
    //     return this.patientService.getAntenatals(id, urlParams);
    // }

    // @Post('save-antenatal')
    // saveAntenatal(
    //     @Body() param: PatientAntenatalDto,
    //     @Request() req,
    // ) {
    //     return this.patientService.doSaveAntenatal(param, req.user.username);
    // }

    // @Patch(':antenatalId/update-antenatal')
    // updateAntenatal(
    //     @Param('antenatalId') antenatalId: string,
    //     @Body() param: PatientAntenatalDto,
    //     @Request() req,
    // ) {
    //     return this.patientService.doUpdateAntenatal(antenatalId, param, req.user.username);
    // }

    // @Delete(':antenatalId/delete-antenatal')
    // deletePatientAntenatal(
    //     @Param('antenatalId') antenatalId: string,
    // ) {
    //     return this.patientService.deleteAntenatal(antenatalId);
    // }

    @Get(':id/allergies')
    getAllergies(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <PatientAllergy[]> {
        return this.patientService.getAllergies(id, urlParams);
    }

    @Post('save-allergies')
    @UsePipes(ValidationPipe)
    saveAllergies(
        @Body() param: PatientAllergyDto,
        @Request() req,
    ) {
        return this.patientService.doSaveAllergies(param, req.user.username);
    }

    @Patch(':allergyId/update-allergy')
    @UsePipes(ValidationPipe)
    updateAllergy(
        @Param('allergyId') allergyId: string,
        @Body() param: PatientAllergyDto,
        @Request() req,
    ) {
        return this.patientService.doUpdateAllergy(allergyId, param, req.user.username);
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
        @Request() req,
    ) {
        return this.patientService.doSaveRequest(param, req.user.username);
    }

    @Post('fill-request')
    fillRequest(
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doFillRequest(param, req.user.username);
    }

    @Get('/requests/:requestType')
    getRequests(
        @Param('requestType') requestType: string,
        @Query() urlParams,
    ): Promise <PatientRequest[]> {
        return this.patientService.listRequests(requestType, urlParams);
    }

    @Get(':patientId/request/:requestType')
    getPatientRequests(
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

    @Post(':id/upload-document')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadDocument(
        @Param('id') id: string,
        @Body() param,
        @UploadedFile() file,
        @Request() req,
    ): Promise<any> {
        return this.patientService.doUploadDocument(id, param, (file) ? `${file.filename}` : '', req.user.username);
    }

    @Post(':requestId/upload-request-document')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FilesInterceptor('files', 20, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadRequestDocument(
        @Param('requestId') id: string,
        @Body() param,
        @UploadedFiles() files,
        @Request() req,
    ) {
        return this.patientService.doUploadRequestDocument(id, param, files, req.user.username);
    }

    @Get('download/:filename')
    downloadFile(
        @Param('filename') filename,
        @Res() response,
    ) {
        // const file = fs.readFile(`uploads/${filename}`)
        return response.sendFile(join(__dirname, '../../../uploads/') + filename  );
    }

    @Get(':id/immunizations')
    getPatientImmunizations(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <Immunization[]> {
        return this.patientService.getPatientImmunizations(id, urlParams);
    }

    @Get('/immunizations')
    getImmunizations(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise <Immunization[]> {
        return this.patientService.getImmunizations(urlParams);
    }

    @Post('/immunizations')
    @UsePipes(ValidationPipe)
    saveImmunizations(
        @Body() param: ImmunizationDto,
        @Request() req,
    ) {
        return this.patientService.saveNewImmunization(param, req.user.username);
    }

    @Patch(':immunizationId/immunizations')
    @UsePipes(ValidationPipe)
    updateImmunization(
        @Param('immunizationId') id: string,
        @Body() param: ImmunizationDto,
        @Request() req,
    ) {
        return this.patientService.doUpdateImmunization(id, param, req.user.username);
    }

    @Delete(':immunizationId/immunizations')
    deleteImmunization(
        @Param('immunizationId') immunizationId: string,
    ) {
        return this.patientService.deleteImmunization(immunizationId);
    }

}
