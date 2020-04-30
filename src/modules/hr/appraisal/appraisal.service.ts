import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformanceAppraisal } from './entities/performance_appraisal.entity';
import { CreateAppriasalDto } from './dto/create-appraisal.dto';
import { PerformanceAppraisalRepository } from './repositories/performance_appraisal.repository';
import { PerformanceIndicatorRepository } from './repositories/performance_indicator.repository';
import { StaffRepository } from '../staff/staff.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { UpdateAppraisalDto } from './dto/update-appraisal.dto';
import { CreateAppriasalPeriodDto } from './dto/create-appraisal-period.dto';
import { PerformanceAppraisalPeriodRepository } from './repositories/performance_appraisal_period.repository';
import { PerformanceIndicatorReport } from './entities/performance_indicator_reports.entity';
import { PerformanceCommentRepository } from './repositories/performance_comment.repository';
import { PerformanceComment } from './entities/performance_comments.entity';
import { PerformanceIndicatorReportRepository } from './repositories/performance_indicator_report.repository';
import { SupervisorEvaluation } from './entities/supervisor.evaluation.entity';
import { PerformanceAppraisalPeriod } from './entities/performance_appraisal_period.entity';

@Injectable()
export class AppraisalService {
    constructor(
        @InjectRepository(PerformanceCommentRepository)
        private performanceCommentRepository: PerformanceCommentRepository,
        @InjectRepository(PerformanceAppraisalRepository)
        private performanceAppraisalRepository: PerformanceAppraisalRepository,
        @InjectRepository(PerformanceAppraisalPeriodRepository)
        private performanceAppraisalPeriodRepository: PerformanceAppraisalPeriodRepository,
        @InjectRepository(PerformanceIndicatorRepository)
        private performanceIndicatorRepository: PerformanceIndicatorRepository,
        @InjectRepository(PerformanceIndicatorReportRepository)
        private performanceIndicatorReportRepository: PerformanceIndicatorReportRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
    ) {}

    async save(createAppraisalDto: CreateAppriasalDto) {
        const { staffId, lineManagerId, indicators, departmentId } = createAppraisalDto;
        // find staff
        const staff = await this.staffRepository.findOne(staffId);
        // find line manager
        const lineManager = await this.staffRepository.findOne(lineManagerId);

        try {
            const appraisal = new PerformanceAppraisal();
            appraisal.staff             = staff;
            appraisal.lineManager       = lineManager;
            if (departmentId) {
                const department = await this.departmentRepository.findOne(departmentId);
                appraisal.department = department;
            }
            await appraisal.save();
            // save indicators
            this.saveIndicators(appraisal, indicators);
            return {success: true, appraisal};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async savePerformancePeriod(createAppraisalPeriodDto: CreateAppriasalPeriodDto) {
        try {
            // console.log(createAppraisalPeriodDto);
            const performancePeriod = await this.performanceAppraisalPeriodRepository.save(createAppraisalPeriodDto);
            return { success: true};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async getPerformancePeriod(): Promise<PerformanceAppraisalPeriod[]> {
        const periods = await this.performanceAppraisalPeriodRepository.find();
        return periods;
    }

    async updatePerformancePeriod(createAppriasalPeriodDto: CreateAppriasalPeriodDto) {
        try {
            if (!createAppriasalPeriodDto.id) {
                throw new NotFoundException(`Internal server error. No ID was sent.`);
            }

            const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne(createAppriasalPeriodDto.id);
            performancePeriod.performancePeriod = createAppriasalPeriodDto.performancePeriod;
            performancePeriod.startDate = createAppriasalPeriodDto.startDate;
            performancePeriod.endDate = createAppriasalPeriodDto.endDate;
            await performancePeriod.save();
            return { success: true };

        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async updatePerformancePeriodStatus(id) {
        const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne(id);
        performancePeriod.isActive = !performancePeriod.isActive;
        await performancePeriod.save();
        return { success: true };
    }

    async getStaffAppraisal(staffId) {
        // find staff record
        const staff = await this.staffRepository.findOne(staffId);
        // find staff appraisal
        const appraisal = await this.performanceAppraisalRepository.findOne({where: {staff}, relations: ['staff', 'lineManager']});

        return appraisal;
    }

    async getStaffAppraisalReport(staffId, periodId) {
        // find staff record
        const staff = await this.staffRepository.findOne(staffId);
        // find staff appraisal
        const appraisal = await this.performanceAppraisalRepository.findOne({where: {staff}});
        // find performance period
        const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne(periodId);
        // find indicator reports
        const indicators = await this.performanceIndicatorReportRepository.find({where: {period: performancePeriod, appraisal}, relations: ['indicator']});

        return {appraisal, indicators};
    }

    saveIndicators(appraisal, indicators) {
        if (indicators.length) {
            for (const indicator of indicators) {
                indicator.appraisal = appraisal;
                this.performanceIndicatorRepository.save(indicator);
            }
        }
    }

    async saveSelfAssessment(param) {
        try {
            const {appraisalId, employeeComment, indicators} = param;
            // find active performance period
            const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne({where: {isActive: true}});
            // find appraisal info
            const appraisal = await this.performanceAppraisalRepository.findOne(appraisalId);

            for (const item of indicators) {
                // find indicator object
                const indicator = await this.performanceIndicatorRepository.findOne(item.indicatorId);
                // save new indicator report;
                const report = new PerformanceIndicatorReport();
                report.selfAssessment = item.weight;
                report.appraisal = appraisal;
                report.period = performancePeriod;
                report.indicator = indicator;
                await report.save();
            }
            // save comment
            const comment = new PerformanceComment();
            comment.period          = performancePeriod;
            comment.appraisal       = appraisal;
            comment.employeeComment = employeeComment;
            await comment.save();

            return {success: true};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async lineManagerAssessment(param) {
        try {
            const {appraisalId, lineManagerComment, indicators} = param;
            // find active performance period
            const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne({where: {isActive: true}});
            // find appraisal info
            const appraisal = await this.performanceAppraisalRepository.findOne(appraisalId);

            for (const item of indicators) {
                // find indicator object
                const indicator = await this.performanceIndicatorRepository.findOne(item.indicatorId);
                // find indicator reports
                const report = await this.performanceIndicatorReportRepository.findOne({where: {indicator}});
                report.lineManagerAssessment = item.weight;
                await report.save();
            }
            // save comment
            const comment = await this.performanceCommentRepository.findOne({where: {period: performancePeriod, appraisal}});
            comment.lineManagerComment = lineManagerComment;
            await comment.save();

            return {success: true};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async saveRecommendation(appraisalId, param) {
        try {
            const appraisal = await this.performanceAppraisalRepository.findOne(appraisalId);
            // find active performance period
            const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne({where: {isActive: true}});
            // save comment
            const comment = await this.performanceCommentRepository.findOne({where: {period: performancePeriod, appraisal}});
            comment.recommendation = param.recommendation;
            await comment.save();

            return {success: true};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async updateAppraisal(id, updateAppraisalDto: UpdateAppraisalDto) {
        const { staffId, lineManagerId, indicators, departmentId } = updateAppraisalDto;
        // find staff
        const staff = await this.staffRepository.findOne(staffId);
        // find line manager
        const lineManager = await this.staffRepository.findOne(lineManagerId);
        try {
            // find appraisal
            const appraisal = await this.performanceAppraisalRepository.findOne(id);
            appraisal.staff             = staff;
            appraisal.lineManager       = lineManager;
            if (departmentId) {
                const department = await this.departmentRepository.findOne(departmentId);
                appraisal.department = department;
            }
            // save indicator score
            for (const item of indicators) {
                const indicator = await this.performanceIndicatorRepository.findOne(item.id);
                indicator.keyFocus  = item.keyFocus;
                indicator.objective = item.objective;
                indicator.kpis      = item.kpis;
                indicator.weight    = item.weight;
                await indicator.save();
            }

        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async deleteAppraisal(id: string) {
        const result = await this.performanceAppraisalRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Appraisal with '${id}' does not exist`);
        }
        return {success: true};
    }

    async saveEvaluation(param) {
        const { sectionTitle, items} = param;
        const evaluation = new SupervisorEvaluation();
        evaluation.sectionTitle = sectionTitle;
        evaluation.items = items;
        evaluation.save();
    }
}
