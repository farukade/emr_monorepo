import { Module } from '@nestjs/common';
import { AppraisalService } from './appraisal.service';
import { AppraisalController } from './appraisal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceAppraisalRepository } from './repositories/performance_appraisal.repository';
import { PerformanceIndicatorRepository } from './repositories/performance_indicator.repository';
import { StaffRepository } from '../staff/staff.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { PerformanceAppraisalPeriodRepository } from './repositories/performance_appraisal_period.repository';
import { PerformanceCommentRepository } from './repositories/performance_comment.repository';
import { PerformanceIndicatorReportRepository } from './repositories/performance_indicator_report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    DepartmentRepository,
    PerformanceCommentRepository,
    PerformanceAppraisalRepository,
    PerformanceAppraisalPeriodRepository,
    PerformanceIndicatorRepository,
    PerformanceIndicatorReportRepository,
    StaffRepository])],
  providers: [AppraisalService],
  controllers: [AppraisalController],
})
export class AppraisalModule {}
