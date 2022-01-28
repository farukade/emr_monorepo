import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from '../repositories/patient.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientFluidChart } from '../entities/patient_fluid_chart.entity';
import { PatientFluidChartRepository } from '../repositories/patient_fluid_chart.repository';
import * as moment from 'moment';
import { AdmissionClinicalTaskRepository } from '../admissions/repositories/admission-clinical-tasks.repository';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { LabourEnrollmentRepository } from '../labour-management/repositories/labour-enrollment.repository';
import { AdmissionClinicalTask } from '../admissions/entities/admission-clinical-task.entity';

@Injectable()
export class PatientFluidChartService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientFluidChartRepository)
        private patientFluidChartRepository: PatientFluidChartRepository,
        @InjectRepository(AdmissionClinicalTaskRepository)
        private clinicalTaskRepository: AdmissionClinicalTaskRepository,
        @InjectRepository(PatientVitalRepository)
        private patientVitalRepository: PatientVitalRepository,
        @InjectRepository(AdmissionsRepository)
		private admissionRepository: AdmissionsRepository,
        @InjectRepository(NicuRepository)
		private nicuRepository: NicuRepository,
        @InjectRepository(LabourEnrollmentRepository)
		private labourEnrollmentRepository: LabourEnrollmentRepository,
    ) {
    }

    async getCharts(options: PaginationOptionsInterface, params: any): Promise<any> {
        const { patient_id, type, item_id } = params;

        const query = this.patientFluidChartRepository.createQueryBuilder('q').select('q.*');

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', { patient_id });
        }

        if (type && type === 'admission') {
            query.andWhere('q.admission_id = :id', { id: item_id });
        }

        if (type && type === 'nicu') {
            query.andWhere('q.nicu_id = :id', { id: item_id });
        }

        if (type && type === 'labour') {
            query.andWhere('q.labour_id = :id', { id: item_id });
        }

        const page = options.page - 1;

        const items = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        let charts = [];
        for (const item of items) {
            const patient = await this.patientRepository.findOne(patient_id);

            charts = [...charts, { ...item, patient }];
        }

        return {
            result: charts,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async saveChart(param: any, createdBy: string) {
        const { patient_id, type, fluidRoute, volume, task_id } = param;

        const patient = await this.patientRepository.findOne(patient_id);

        const admission = await this.admissionRepository.findOne({ where: { patient, status: 0 } });

        const nicu = await this.nicuRepository.findOne({ where: { patient, status: 0 } });

        const labour = await this.labourEnrollmentRepository.findOne({ where: { patient, status: 0 } });

        const chart = new PatientFluidChart();
        chart.type = type;
        chart.fluid_route = fluidRoute;
        chart.patient = patient;
        chart.volume = volume;
        chart.createdBy = createdBy;
        chart.admission_id = admission?.id || null;
        chart.nicu_id = nicu?.id || null;
        chart.labour_id = labour?.id || null;

        const fluidChart = await chart.save();

        let task: AdmissionClinicalTask;
        if (task_id !== '') {
            task = await this.clinicalTaskRepository.findOne(task_id);

            if (task && task.tasksCompleted < task.taskCount) {
                let nextTime: string;
                switch (task.intervalType) {
                    case 'minutes':
                        nextTime = moment().add(task.interval, 'm').format('YYYY-MM-DD HH:mm:ss');
                        break;
                    case 'hours':
                        nextTime = moment().add(task.interval, 'h').format('YYYY-MM-DD HH:mm:ss');
                        break;
                    case 'days':
                        nextTime = moment().add(task.interval, 'd').format('YYYY-MM-DD HH:mm:ss');
                        break;
                    case 'weeks':
                        nextTime = moment().add(task.interval, 'w').format('YYYY-MM-DD HH:mm:ss');
                        break;
                    case 'months':
                        nextTime = moment().add(task.interval, 'M').format('YYYY-MM-DD HH:mm:ss');
                        break;
                    default:
                        break;
                }

                const completed = task.tasksCompleted + 1;

                task.nextTime = nextTime;
                task.tasksCompleted = completed;
                task.lastChangedBy = createdBy;
                task.completed = completed === task.taskCount;
                await task.save();
            }
        }

        const data = {
            readingType: 'Fluid Chart',
            reading: {type, fluid_route: fluidRoute, volume},
            patient,
            createdBy,
            task: task || null,
            admission_id: admission?.id || null,
            nicu_id: nicu?.id || null,
            labour_id: labour?.id || null,
            fluidChart,
        };

        // @ts-ignore
        return await this.patientVitalRepository.save(data);
    }

    async updateChart(id: number, param, username: string) {
        const { patient_id, type, fluidRoute, volume } = param;

        try {
            const patient = await this.patientRepository.findOne(patient_id);

            const chart = await this.patientFluidChartRepository.findOne(id);
            chart.type = type;
            chart.fluid_route = fluidRoute;
            chart.patient = patient;
            chart.volume = volume;
            chart.lastChangedBy = username;
            await chart.save();

            return { success: true, data: chart };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async deleteChart(id: number, username: string) {
        const chart = await this.patientFluidChartRepository.findOne(id);

        if (!chart) {
            throw new NotFoundException(`Fluid Chart with ID '${id}' not found`);
        }

        chart.deletedBy = username;
        await chart.save();

        return chart.softRemove();
    }
}
