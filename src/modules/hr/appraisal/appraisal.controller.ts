import { Controller, Post, UsePipes, ValidationPipe, Body, Param, Patch, Delete, Get } from '@nestjs/common';
import { CreateAppriasalDto } from './dto/create-appraisal.dto';
import { AppraisalService } from './appraisal.service';
import { UpdateAppraisalDto } from './dto/update-appraisal.dto';
import { CreateAppriasalPeriodDto } from './dto/create-appraisal-period.dto';

@Controller('hr/appraisal')
export class AppraisalController {

    constructor(private appraisalService: AppraisalService) {}
    @Post('new')
    @UsePipes(ValidationPipe)
    createNewAppriasal(
        @Body() createAppriasalDto: CreateAppriasalDto,
    ) {
        return this.appraisalService.save(createAppriasalDto);
    }

    @Patch(':id/update')
    updateAppraisal(
        @Param() id: string,
        @Body() updateAppraisalDto: UpdateAppraisalDto,
    ) {
        return this.appraisalService.updateAppraisal(id, updateAppraisalDto);
    }

    @Post('save-period')
    @UsePipes(ValidationPipe)
    saveAppraisalPeriod(
        @Body() createAppriasalPeriodDto: CreateAppriasalPeriodDto,
    ) {
        return this.appraisalService.savePerformancePeriod(createAppriasalPeriodDto);
    }

    @Patch('update-period')
    @UsePipes(ValidationPipe)
    updateAppraisalPeriod(
        @Body() createAppriasalPeriodDto: CreateAppriasalPeriodDto,
    ) {
        return this.appraisalService.updatePerformancePeriod(createAppriasalPeriodDto);
    }

    @Get('update-period-status/:id')
    updatePeriodStatus(
        @Param('id') id: string,
    ) {
        return this.appraisalService.updatePerformancePeriodStatus(id);
    }

    @Get('staff-assessment/:staffId')
    getAssessmentInfo(
        @Param('staffId') staffId: string,
    ) {
        return this.appraisalService.getStaffAppraisal(staffId);
    }

    @Get('report/:periodId/:staffId')
    getAssessmentReportInfo(
        @Param('staffId') staffId: string,
        @Param('periodId') periodId: string,
    ) {
        return this.appraisalService.getStaffAppraisalReport(staffId, periodId);
    }

    @Post('self-assessment')
    selfAssessment(
        @Body() param,
    ) {
        return this.appraisalService.saveSelfAssessment(param);
    }

    @Patch('line-manager-assessment')
    lineManagerAssessment(
        @Body() param,
    ) {
        return this.appraisalService.lineManagerAssessment(param);
    }

    @Patch(':appraisalId/recommendation')
    recommendation(
        @Param() id: string,
        @Body() param,
    ) {
        return this.appraisalService.saveRecommendation(id, param);
    }

    @Delete(':id')
    deleteAppraisal(@Param('id') id: string) {
        return this.appraisalService.deleteAppraisal(id);
    }

    @Post('save-evaluations')
    saveSupervisorEvaluation(
        @Body() param,
    ) {
        return this.appraisalService.saveEvaluation(param);
    }
}
