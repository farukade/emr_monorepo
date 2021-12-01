// tslint:disable-next-line:max-line-length
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, Res, UseGuards, Request} from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { Voucher } from '../finance/vouchers/voucher.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PatientDocument } from './entities/patient_documents.entity';
import { AuthGuard } from '@nestjs/passport';
import { OpdPatientDto } from './dto/opd-patient.dto';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PatientAlert } from './entities/patient_alert.entity';
import { PatientNote } from './entities/patient_note.entity';

@Controller('patient')
export class PatientController {
    constructor(private patientService: PatientService) {
    }

    @Get('list')
    listAllPatients(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.patientService.listAllPatients({ page, limit }, urlParams);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('find')
    findPatientRecord(
        @Query() param,
        @Request() request,
    ): Promise<Patient[]> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 50;

        return this.patientService.findPatient({ limit }, param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('save')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    saveNewPatient(
        @Body() patientDto: PatientDto,
        @UploadedFile() pic,
        @Request() req,
    ): Promise<any> {
        return this.patientService.saveNewPatient(patientDto, req.user.username, pic);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('opd')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    saveNewOpdPatient(
        @Body() opdPatientDto: OpdPatientDto,
        @UploadedFile() pic,
        @Request() req,
    ): Promise<any> {
        return this.patientService.saveNewOpdPatient(opdPatientDto, req.user.username, pic);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/update')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    updatePatientCall(
        @Param('id') id: string,
        @Body() patientDto: PatientDto,
        @UploadedFile() pic,
        @Request() req,
    ): Promise<any> {
        return this.patientService.updatePatientRecord(id, patientDto, req.user.username, pic);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    deletePatient(
        @Param('id') id: number,
        @Request() req,
    ): Promise<Patient> {
        return this.patientService.deletePatient(id, req.user.username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('check-payment-status')
    checkPaymentStatus(
        @Body() param,
    ) {
        return this.patientService.checkPaymentStatus(param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/vouchers')
    getVouchers(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise<Voucher[]> {
        return this.patientService.getVouchers(id, urlParams);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/transactions')
    getTransactions(
        @Param('id') id: number,
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.patientService.getTransactions({ page, limit }, id, urlParams);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:id/outstandings')
    getAmounts(
        @Param('id') id: number,
    ): Promise<any> {
        return this.patientService.getAmounts(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/documents')
    getPatientDocument(
        @Param('id') id: number,
        @Query() urlParams,
        @Request() request,
    ): Promise<PatientDocument[]> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.patientService.getDocuments({ page, limit }, id, urlParams);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/vitals')
    getVitals(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise<PatientVital[]> {
        return this.patientService.getVitals(id, urlParams);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('save-vitals')
    saveVitals(
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doSaveVitals(param, req.user.username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':vitalId/update-vital')
    updateVital(
        @Param('vitalId') vitalId: string,
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doUpdateVital(vitalId, param, req.user.username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':vitalId/delete-vital')
    deletePatientVital(
        @Param('vitalId') vitalId: string,
    ) {
        return this.patientService.deleteVital(vitalId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/diagnoses')
    getDiagnoses(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise<PatientNote[]> {
        return this.patientService.getDiagnoses(id, urlParams);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/alerts')
    getAlerts(
        @Param('id') id: number,
    ): Promise<PatientAlert[]> {
        return this.patientService.getAlerts(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/read-alert')
    readAlert(
        @Param('id') id: number,
        @Request() req,
    ) {
        return this.patientService.readAlert(id, req.user.username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/upload-document')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/docs',
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
        return this.patientService.doUploadDocument(id, param, file.filename, req.user.username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/credit-limit')
    saveCreditLimit(
        @Param('id') id: number,
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doSaveCreditLimit(id, param, req.user.username);
    }
}
