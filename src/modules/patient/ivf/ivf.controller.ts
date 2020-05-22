import { Controller, UseGuards, Post, Body, Request, Param, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IvfService } from './ivf.service';
import { IvfEnrollementDto } from './dto/ivf_enrollment.dto';
import { IvfEnrollment } from './ivf_enrollment.entity';

@UseGuards(AuthGuard('jwt'))

@Controller('ivf')
export class IvfController {
    constructor(private ivfEnrollmentService: IvfService) {}

    @Post('enroll')
    saveEnrollment(
        @Body() ivfEnrollementDto: IvfEnrollementDto,
        @Request() req,
    ) {
        return this.ivfEnrollmentService.saveEnrollment(ivfEnrollementDto, req.user.userId);
    }

    @Get(':patientId/history')
    ivfHistory(@Param('patientId') patientId: string ): Promise<IvfEnrollment[]> {
        return this.ivfEnrollmentService.getHistory(patientId);
    }

    @Get('enrollments')
    listEnrollments(
        @Query() params,
    ) {
        return this.ivfEnrollmentService.getEnrollments(params);
    }
}
