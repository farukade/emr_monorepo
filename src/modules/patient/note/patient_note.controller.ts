import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  Delete,
  UseGuards,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientNoteService } from './patient_note.service';
import { PatientNote } from '../entities/patient_note.entity';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('patient-notes')
export class PatientNoteController {
  constructor(private patientNoteService: PatientNoteService) {}

  @Get('')
  getNotes(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.patientNoteService.getNotes({ page, limit }, urlParams);
  }

  @Post('')
  @UsePipes(ValidationPipe)
  saveNote(@Body() params, @Request() req) {
    return this.patientNoteService.saveNote(params, req.user.username);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateNote(@Param('id') id: number, @Body() param, @Request() req) {
    return this.patientNoteService.updateNote(id, param, req.user.username);
  }

  @Post('/:id/resolve')
  @UsePipes(ValidationPipe)
  resolveDiagnosis(@Param('id') id: number, @Request() req) {
    return this.patientNoteService.resolveDiagnosis(id, req.user.username);
  }

  @Delete('/:id')
  deleteNote(@Param('id') id: number, @Request() req): Promise<PatientNote> {
    return this.patientNoteService.deleteNote(id, req.user.username);
  }
}
