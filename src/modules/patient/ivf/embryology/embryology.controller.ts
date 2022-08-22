import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { EmbryoAssessmentDto } from './dto/embryo-assessment.dto';
import { EmbryoTransferDto } from './dto/embryo-transfer.dto';
import { EmbryoIcsiDto } from './dto/icsi.dto';
import { EmbryoSpermPrepDto } from './dto/sperm-prep.dto';
import { EmbryoTreatmentDto } from './dto/treatment.dto';
import { IvfEmbryologyService } from './embryology.service';

// @UseGuards(AuthGuard('jwt'))
@ApiTags('Embryology')
@Controller('embryology')
export class EmbryologyController {
  constructor(private embryologyService: IvfEmbryologyService) { }

  @Post('assessment/create')
  saveAssessment(@Body() data: EmbryoAssessmentDto) {
    return this.embryologyService.saveAssessment(data);
  }

  @Post('transfer/create')
  saveTransfer(@Body() data: EmbryoTransferDto) {
    return this.embryologyService.saveTransfer(data);
  }

  @Post('icsi/create')
  saveIcsi(@Body() data: EmbryoIcsiDto) {
    return this.embryologyService.saveIcsi(data);
  }

  @Post('sperm-prep/create')
  saveSpermPrep(@Body() data: EmbryoSpermPrepDto) {
    return this.embryologyService.saveSpermPrep(data);
  }

  @Post('treatment/create')
  saveTreatment(@Body() data: EmbryoTreatmentDto) {
    return this.embryologyService.saveTreatment(data);
  }

  @Get('/')
  getEmbryologyById(@Query() urlParams) {
    return this.embryologyService.getEmbryologyById(urlParams);
  }

  @Patch('treatment/update')
  updateTreatment(@Body() data) {
    return this.embryologyService.updateTreatment(data);
  };

  @Patch('sperm-prep/update')
  updateSperm(@Body() data) {
    return this.embryologyService.updateSperm(data);
  };

  @Patch('icsi/update')
  updateIcsi(@Body() data) {
    return this.embryologyService.updateIcsi(data);
  }

  @Patch('transfer/update')
  updateTransfer(@Body() data) {
    return this.embryologyService.updateTransfer(data);
  }

  @Patch('assessment/update')
  updateAssessment(@Body() data) {
    return this.embryologyService.updateAssessment(data);
  }
}
