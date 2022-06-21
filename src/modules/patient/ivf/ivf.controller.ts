import { Controller, UseGuards, Post, Body, Request, Param, Get, Query, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IvfService } from './ivf.service';
import { IvfEnrollmentDto } from './dto/ivf_enrollment.dto';
import { IvfEnrollment } from './entities/ivf_enrollment.entity';
import { IvfDownRegulationChartDto } from './dto/ivf-down-regulation-chart.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('ivf')
export class IvfController {
  constructor(private ivfService: IvfService) {}

  @Get('')
  listEnrollments(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.ivfService.getEnrollments({ page, limit }, urlParams);
  }

  @Post('enroll')
  saveEnrollment(@Body() ivfEnrollmentDto: IvfEnrollmentDto, @Request() req) {
    return this.ivfService.saveEnrollment(ivfEnrollmentDto, req.user.username);
  }

  @Get(':patientId/history')
  ivfHistory(@Param('patientId') patientId: string): Promise<IvfEnrollment[]> {
    return this.ivfService.getHistory(patientId);
  }

  @Post('save/down-regulation')
  saveDownRegulationChart(@Body() ivfDownRegulationChartDto: IvfDownRegulationChartDto, @Request() req) {
    return this.ivfService.doSaveDownRegulationChart(ivfDownRegulationChartDto, req.user);
  }

  @Post('save/hcg-administration')
  saveHcgAdministration(@Body() params, @Request() req) {
    return this.ivfService.doSaveHCGAdministration(params, req.user.username);
  }

  @Post('save/theatre-procedure')
  saveTheatreProcedure(@Body() params, @Request() req) {
    return this.ivfService.doSaveTheatreProcedure(params, req.user);
  }

  @Delete('/:id')
  deleteIVF(@Param('id') id: number, @Request() req): Promise<any> {
    return this.ivfService.deleteIVF(id, req.user.username);
  }
}
