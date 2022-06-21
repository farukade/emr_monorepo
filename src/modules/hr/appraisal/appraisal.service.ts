/* eslint-disable @typescript-eslint/no-var-requires */
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
import { getConnection } from 'typeorm';
import { PerformanceIndicator } from './entities/performance_indicator.entity';

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
    console.log(createAppraisalDto);
    const { staffId, lineManagerId, indicators, departmentId } = createAppraisalDto;
    // find staff
    const staff = await this.staffRepository.findOne(staffId);
    // check if staff appraisal already exists
    const hasAppraisal = await this.performanceAppraisalRepository.findOne({
      where: { staff },
    });
    if (hasAppraisal) {
      throw new NotFoundException(`Appraisal already exists for this staff`);
    }

    try {
      // find department
      const department = await this.departmentRepository.findOne(departmentId, {
        relations: ['staff'],
      });
      // save appraisal details
      const appraisal = new PerformanceAppraisal();
      appraisal.staff = staff;
      appraisal.lineManager = department.staff;
      appraisal.department = department;
      await appraisal.save();
      // save indicators
      this.saveIndicators(appraisal, indicators);
      return { success: true, appraisal };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async savePerformancePeriod(createAppraisalPeriodDto: CreateAppriasalPeriodDto) {
    try {
      // console.log(createAppraisalPeriodDto);
      const performancePeriod = await this.performanceAppraisalPeriodRepository.save(createAppraisalPeriodDto);
      return { success: true, performancePeriod };
    } catch (error) {
      return { success: false, message: error.message };
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
      return { success: true, performancePeriod };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updatePerformancePeriodStatus(id) {
    const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne(id);
    performancePeriod.isActive = false;
    const rs = await performancePeriod.save();
    return { success: true, data: rs };
  }

  async getStaffAppraisal(staffId) {
    // find staff record
    const staff = await this.staffRepository.findOne(staffId);
    // find staff appraisal
    const appraisal = await this.performanceAppraisalRepository.findOne({
      where: { staff },
      relations: ['staff', 'lineManager'],
    });

    return appraisal;
  }

  async getStaffAppraisalReport(staffId, periodId) {
    try {
      // find staff record
      const staff = await this.staffRepository.findOne(staffId);
      // find staff appraisal
      const appraisal = await this.performanceAppraisalRepository.findOne({
        where: { staff },
      });
      // find performance period
      const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne(periodId);
      // find indicator reports
      const indicators = await this.performanceIndicatorReportRepository.find({
        where: { period: performancePeriod, appraisal },
        relations: ['indicator'],
      });

      return { appraisal, indicators };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  saveIndicators(appraisal, indicators) {
    if (indicators.length) {
      for (const indicator of indicators) {
        indicator.appraisal = appraisal;
        this.performanceIndicatorRepository.save(indicator);
      }
    }
  }

  async saveIndicator(dto: any) {
    const { keyFocus, objective, weight, kpis, departmentId } = dto;
    const department = await this.departmentRepository.findOne(departmentId, {
      relations: ['staff'],
    });
    const indicator = new PerformanceIndicator();
    indicator.keyFocus = keyFocus;
    indicator.kpis = kpis;
    indicator.isSettingsObject = true;
    indicator.objective = objective;
    indicator.weight = weight;
    indicator.department = department;
    this.performanceIndicatorRepository.save(indicator);
    return { success: true, indicator };
  }

  async settingIndicators(department_id) {
    const isSettingsObject = true;
    const indicators = await this.performanceIndicatorRepository
      .createQueryBuilder('performance_indicators')
      .where('performance_indicators.department_id = :department_id', {
        department_id,
      })
      .andWhere('performance_indicators.isSettingsObject = :isSettingsObject', {
        isSettingsObject,
      })
      .select(['performance_indicators.createdAt as created_at'])
      .orderBy('performance_indicators.createdAt', 'DESC')
      .getMany();
    return indicators;
  }

  async deleteIndicator(id) {
    const result = await this.performanceIndicatorRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Indicator with '${id}' does not exist`);
    }
    return { success: true };
  }

  async saveSelfAssessment(param) {
    try {
      const { appraisalId, employeeComment, indicators } = param;
      // find active performance period
      const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne({ where: { isActive: true } });
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
      comment.period = performancePeriod;
      comment.appraisal = appraisal;
      comment.employeeComment = employeeComment;
      await comment.save();

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async lineManagerAssessment(param) {
    try {
      const { appraisalId, lineManagerComment, indicators } = param;
      // find active performance period
      const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne({ where: { isActive: true } });
      // find appraisal info
      const appraisal = await this.performanceAppraisalRepository.findOne(appraisalId);

      for (const item of indicators) {
        // find indicator object
        const indicator = await this.performanceIndicatorRepository.findOne(item.indicatorId);
        // find indicator reports
        const report = await this.performanceIndicatorReportRepository.findOne({
          where: { indicator },
        });
        report.lineManagerAssessment = item.weight;
        await report.save();
      }
      // save comment
      const comment = await this.performanceCommentRepository.findOne({
        where: { period: performancePeriod, appraisal },
      });
      comment.lineManagerComment = lineManagerComment;
      await comment.save();

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async saveRecommendation(appraisalId, param) {
    try {
      const appraisal = await this.performanceAppraisalRepository.findOne(appraisalId);
      // find active performance period
      const performancePeriod = await this.performanceAppraisalPeriodRepository.findOne({ where: { isActive: true } });
      // save comment
      const comment = await this.performanceCommentRepository.findOne({
        where: { period: performancePeriod, appraisal },
      });
      comment.recommendation = param.recommendation;
      await comment.save();

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
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
      // find department
      const department = await this.departmentRepository.findOne(staff.department.id, { relations: ['staff'] });
      // save appraisal details
      appraisal.staff = staff;
      appraisal.lineManager = department.staff;
      appraisal.department = department;
      await appraisal.save();
      // save indicator score
      for (const item of indicators) {
        const indicator = await this.performanceIndicatorRepository.findOne(item.id);
        indicator.keyFocus = item.keyFocus;
        indicator.objective = item.objective;
        indicator.kpis = item.kpis;
        indicator.isSettingsObject = false;
        indicator.weight = item.weight;
        await indicator.save();
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deleteAppraisal(id: string) {
    const result = await this.performanceAppraisalRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Appraisal with '${id}' does not exist`);
    }
    return { success: true };
  }

  async saveEvaluation(param) {
    const { sectionTitle, items } = param;
    const evaluation = new SupervisorEvaluation();
    evaluation.sectionTitle = sectionTitle;
    evaluation.items = items;
    evaluation.save();
  }

  async downloadAppraisalSample() {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
      path: 'sample-performance-appraisal.csv',
      header: [
        { id: 'key_focus', title: 'KEY FOCUS' },
        { id: 'objective', title: 'OBJECTIVE' },
        { id: 'kpis', title: 'KPIs' },
        { id: 'weight', title: 'WEIGHT' },
      ],
    });

    const data = [
      {
        key_focus: '',
        objective: '',
        kpis: '',
        weight: '',
      },
    ];
    await csvWriter.writeRecords({ data });
    return { message: 'Completed' };
  }

  async doUpload(file: any, createAppraisalDto: CreateAppriasalDto) {
    const { staffId, lineManagerId, departmentId } = createAppraisalDto;
    // find staff
    const staff = await this.staffRepository.findOne(staffId, {
      relations: ['department'],
    });
    // check if staff appraisal already exists
    let appraisal = await this.performanceAppraisalRepository.findOne({
      where: { staff },
    });
    if (!appraisal) {
      // find department
      const department = await this.departmentRepository.findOne(staff.department.id, { relations: ['staff'] });
      // save appraisal details
      appraisal = new PerformanceAppraisal();
      appraisal.staff = staff;
      appraisal.lineManager = department.staff;
      appraisal.department = department;
      await appraisal.save();
    }

    const csv = require('csv-parser');
    const fs = require('fs');
    const indicators = [];
    try {
      // read uploaded file
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (row) => {
          const data = {
            keyFocus: row['KEY FOCUS'],
            objective: row.OBJECTIVE,
            kpis: row.KPIs,
            weight: row.WEIGHT,
          };

          indicators.push(data);
        })
        .on('end', async () => {
          // delete previous indicators
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from('performance_indicators')
            .where('"appraisalId" = :id', { id: appraisal.id })
            .execute();

          const data = [];
          let index = -1;
          for (const indicator of indicators) {
            if (indicator.keyFocus !== '') {
              data.push({
                keyFocus: indicator.keyFocus,
                objective: indicator.objective,
                kpis: [indicator.kpis],
                weight: indicator.weight,
              });
              index++;
            } else {
              data[index].kpis.push(indicator.kpis);
            }
          }
          // save indicators
          this.saveIndicators(appraisal, data);
        });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}
