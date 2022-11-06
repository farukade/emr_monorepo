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
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { Voucher } from '../finance/vouchers/voucher.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PatientDocument } from './entities/patient_documents.entity';
import { AuthGuard } from '@nestjs/passport';
import { OpdPatientDto } from './dto/opd-patient.dto';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PatientAlert } from './entities/patient_alert.entity';
import { PatientNote } from './entities/patient_note.entity';
import { Error } from 'apps/emr/src/common/interface/error.interface';

@Controller('patient')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Get('list')
  listAllPatients(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.patientService.listAllPatients({ page, limit }, urlParams);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('find')
  findPatientRecord(@Query() param, @Request() request): Promise<Patient[]> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 50;
    return this.patientService.findPatient({ limit }, param);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  @UsePipes(ValidationPipe)
  saveNewPatient(@Body() patientDto: PatientDto, @UploadedFile() pic, @Request() req): Promise<any> {
    return this.patientService.saveNewPatient(patientDto, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('opd')
  @UsePipes(ValidationPipe)
  saveNewOpdPatient(@Body() opdPatientDto: OpdPatientDto, @UploadedFile() pic, @Request() req): Promise<any> {
    return this.patientService.saveNewOpdPatient(opdPatientDto, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/:id')
  @UsePipes(ValidationPipe)
  updatePatientCall(
    @Param('id') id: string,
    @Body() patientDto: PatientDto,
    @UploadedFile() pic,
    @Request() req,
  ): Promise<any> {
    return this.patientService.updatePatientRecord(id, patientDto, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deletePatient(@Param('id') id: number, @Request() req): Promise<Patient> {
    return this.patientService.deletePatient(id, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/vouchers')
  getVouchers(@Param('id') id: string, @Query() urlParams): Promise<Voucher[]> {
    return this.patientService.getVouchers(id, urlParams);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/transactions')
  getTransactions(@Param('id') id: number, @Query() urlParams, @Request() request): Promise<any> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.patientService.getTransactions({ page, limit }, id, urlParams);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id/outstandings')
  getAmounts(@Param('id') id: number): Promise<any> {
    return this.patientService.getAmounts(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id/admission')
  getAdmission(@Param('id') id: number): Promise<any> {
    return this.patientService.getAdmission(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id/deposit-balance')
  getDepositBalance(@Param('id') id: number): Promise<any> {
    return this.patientService.getDeposit(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/documents')
  getPatientDocument(@Param('id') id: number, @Query() urlParams, @Request() request): Promise<PatientDocument[]> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.patientService.getDocuments({ page, limit }, id, urlParams);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/vitals')
  getVitals(@Param('id') id: string, @Query() urlParams): Promise<PatientVital[]> {
    return this.patientService.getVitals(id, urlParams);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('save-vitals')
  saveVitals(@Body() param, @Request() req) {
    return this.patientService.doSaveVitals(param, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':vitalId/update-vital')
  updateVital(@Param('vitalId') vitalId: string, @Body() param, @Request() req) {
    return this.patientService.doUpdateVital(vitalId, param, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':vitalId/delete-vital')
  deletePatientVital(@Param('vitalId') vitalId: string) {
    return this.patientService.deleteVital(vitalId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/add-diagnosis')
  @UsePipes(ValidationPipe)
  addDiagnosis(@Param('id') id: number, @Body() params, @Request() req) {
    return this.patientService.addDiagnoses(id, params, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/diagnoses')
  getDiagnoses(@Param('id') id: string, @Query() urlParams): Promise<PatientNote[] | Error> {
    return this.patientService.getDiagnoses(id, urlParams);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/alerts')
  getAlerts(@Param('id') id: number, @Query() urlParams): Promise<PatientAlert[]> {
    return this.patientService.getAlerts(id, urlParams);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/close-alert')
  closeAlert(@Param('id') id: number, @Request() req) {
    return this.patientService.closeAlert(id, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/upload-document')
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/documents',
        filename: (req, file, cb) => {
          const randomName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          return cb(null, `doc-${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fieldSize: 1073741824 },
    }),
  )
  uploadDocument(@Param('id') id: string, @Body() param, @UploadedFile() file, @Request() req): Promise<any> {
    return this.patientService.doUploadDocument(+id, param, file.filename, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':patient_id/documents/:id')
  downloadDocument(@Param('id') id: string): Promise<any> {
    return this.patientService.downloadDocument(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/credit-limit')
  saveCreditLimit(@Param('id') id: number, @Body() param, @Request() req) {
    return this.patientService.doSaveCreditLimit(id, param, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/enable')
  enablePatient(@Param('id') id: number, @Request() req) {
    return this.patientService.enable(id, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/disable')
  disablePatient(@Param('id') id: number, @Request() req) {
    return this.patientService.disable(id, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/summary')
  getSummary(@Param('id') id: number): Promise<Voucher[]> {
    return this.patientService.getSummary(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('look-up/phone')
  lookUpPhone(@Body() data) {
    return this.patientService.lookUpUsingPhone(data);
  }
}
