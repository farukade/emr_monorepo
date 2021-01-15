import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UsePipes,
    ValidationPipe,
    UseInterceptors,
    UploadedFile,
    Res,
    UploadedFiles,
    UseGuards,
    Request,
    Render,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { PatientAllergyDto } from './dto/patient.allergy.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { PatientAllergy } from './entities/patient_allergies.entity';
import { PatientRequest } from './entities/patient_requests.entity';
import { Voucher } from '../finance/vouchers/voucher.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PatientDocument } from './entities/patient_documents.entity';
import { PatientRequestDocument } from './entities/patient_request_documents.entity';
import { AuthGuard } from '@nestjs/passport';
import { OpdPatientDto } from './dto/opd-patient.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('patient')
export class PatientController {
    constructor(private patientService: PatientService) {
    }

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

    @Post('opd')
    @UsePipes(ValidationPipe)
    saveOpdPatient(
        @Body() opdPatientDto: OpdPatientDto,
        @Request() req,
    ) {
        return this.patientService.saveNewOpdPatient(opdPatientDto, req.user.username);
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
        @Param('id') id: number,
        @Request() req,
    ): Promise<Patient> {
        return this.patientService.deletePatient(id, req.user.username);
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
    ): Promise<Voucher[]> {
        return this.patientService.getVouchers(id, urlParams);
    }

    @Delete(':id/vouchers')
    deleteVoucher(
        @Param('id') id: number,
        @Request() req,
    ): Promise<Voucher> {
        return this.patientService.deleteVoucher(id, req.user.username);
    }

    @Get(':id/documents')
    getPatientDocument(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise<PatientDocument[]> {
        return this.patientService.getDocuments(id, urlParams);
    }

    @Get(':requestId/request-document')
    getRequestDocument(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise<PatientRequestDocument[]> {
        return this.patientService.getRequestDocuments(id, urlParams);
    }

    @Get(':id/vitals')
    getVitals(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise<PatientVital[]> {
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
    ): Promise<PatientAllergy[]> {
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

    @Post('fill-request/:id')
    fillRequest(
        @Param('id') requestId: string,
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doFillRequest(param, requestId, req.user.username);
    }

    @Get('/requests/:requestType')
    getRequests(
        @Param('requestType') requestType: string,
        @Query() urlParams,
    ): Promise<any> {
        return this.patientService.listRequests(requestType, urlParams);
    }

    @Get(':patientId/request/:requestType')
    getPatientRequests(
        @Param('patientId') id: string,
        @Param('requestType') requestType: string,
        @Query() urlParams,
    ): Promise<any> {
        return this.patientService.listPatientRequests(requestType, id, urlParams);
    }

    @Get(':requestId/print')
    printResult(
        @Param('requestId') requestId: string,
        @Query() urlParams,
    ): Promise<any> {
        return this.patientService.printResult(requestId, urlParams);
    }

    @Patch('request/:requestId/approve-result')
    approveResult(
        @Param('requestId') requestId: string,
        @Query() urlParams,
        @Request() req,
    ) {
        return this.patientService.doApproveResult(requestId, urlParams, req.user.username);
    }

    @Patch(':requestId/reject-result')
    rejectLabResult(
        @Param('requestId') requestId: string,
        @Request() req,
    ) {
        return this.patientService.rejectResult(requestId, req.user.username);
    }

    @Delete(':requestId/delete-request')
    deletePatientRequest(
        @Param('requestId') requestId: string,
        @Query() urlParams,
        @Request() req,
    ) {
        return this.patientService.deleteRequest(requestId, urlParams, req.user.username);
    }

    @Patch(':requestId/receive-specimen')
    receiveLabSpecimen(
        @Param('requestId') requestId: string,
        @Request() req,
    ) {
        return this.patientService.receiveSpecimen(requestId, req.user.username);
    }

    @Patch(':requestId/fill-result')
    fillLabResult(
        @Param('requestId') requestId: string,
        @Request() req,
        @Body() param,
    ) {
        return this.patientService.fillResult(requestId, param, req.user.username);
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
        return response.sendFile(join(__dirname, '../../../uploads/') + filename);
    }
}
