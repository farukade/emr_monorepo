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
import { Voucher } from '../finance/vouchers/voucher.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PatientDocument } from './entities/patient_documents.entity';
import { AuthGuard } from '@nestjs/passport';
import { OpdPatientDto } from './dto/opd-patient.dto';
import { Pagination } from '../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
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
        return this.patientService.listAllPatients({ page: page - 1, limit }, urlParams);
    }

    @Get('find')
    findPatientRecord(
        @Query('q') q: string,
    ): Promise<Patient[]> {
        return this.patientService.findPatient(q);
    }

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
    saveNewPatientCall(
        @Body() patientDto: PatientDto,
        @UploadedFile() pic,
        @Request() req,
    ): Promise<any> {
        return this.patientService.saveNewPatient(patientDto, req.user.username, pic);
    }

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
    saveNewOpdCall(
        @Body() opdPatientDto: OpdPatientDto,
        @UploadedFile() pic,
        @Request() req,
    ): Promise<any> {
        return this.patientService.saveNewOpdPatient(opdPatientDto, req.user.username, pic);
    }

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

    @Get(':id/documents')
    getPatientDocument(
        @Param('id') id: string,
        @Query() urlParams,
    ): Promise<PatientDocument[]> {
        return this.patientService.getDocuments(id, urlParams);
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

    @Post('save-request')
    saveRequest(
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doSaveRequest(param, req.user.username);
    }

    @Patch(':requestId/receive-specimen')
    receiveLabSpecimen(
        @Param('requestId') requestId: number,
        @Request() req,
    ) {
        return this.patientService.receiveSpecimen(requestId, req.user.username);
    }

    // fill request for pharmacy
    @Post('fill-request/:id')
    fillRequest(
        @Param('id') requestId: string,
        @Body() param,
        @Request() req,
    ) {
        return this.patientService.doFillRequest(param, requestId, req.user.username);
    }

    // fill request for others
    @Patch(':requestId/fill-result')
    fillLabResult(
        @Param('requestId') requestId: string,
        @Request() req,
        @Body() param,
    ) {
        return this.patientService.fillResult(requestId, param, req.user.username);
    }

    @Patch('request/:requestId/approve-result')
    approveResult(
        @Param('requestId') requestId: number,
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

    @Get(':requestId/print')
    printResult(
        @Param('requestId') requestId: number,
        @Query() urlParams,
    ): Promise<any> {
        return this.patientService.printResult(requestId, urlParams);
    }

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

    @Get('download/:filename')
    downloadFile(
        @Param('filename') filename,
        @Res() response,
    ) {
        // const file = fs.readFile(`uploads/${filename}`)
        return response.sendFile(join(__dirname, '../../../uploads/') + filename);
    }
}
