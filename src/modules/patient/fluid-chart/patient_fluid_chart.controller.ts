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
import { Pagination } from '../../../common/paginate/paginate.interface';
import { PatientFluidChartService } from './patient_fluid_chart.service';
import { PatientFluidChart } from '../entities/patient_fluid_chart.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('fluid-charts')
export class PatientFluidChartController {
  constructor(private patientFluidChartService: PatientFluidChartService) {}

  @Get('')
  getCharts(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.patientFluidChartService.getCharts({ page, limit }, urlParams);
  }

  @Post('')
  @UsePipes(ValidationPipe)
  saveChart(@Body() param, @Request() req) {
    return this.patientFluidChartService.saveChart(param, req.user.username);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateChart(@Param('id') id: number, @Body() param, @Request() req) {
    return this.patientFluidChartService.updateChart(id, param, req.user.username);
  }

  @Delete('/:id')
  deleteChart(@Param('id') id: number, @Request() req): Promise<PatientFluidChart> {
    return this.patientFluidChartService.deleteChart(id, req.user.username);
  }
}
