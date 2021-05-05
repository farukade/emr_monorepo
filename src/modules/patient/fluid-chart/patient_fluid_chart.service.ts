import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from '../repositories/patient.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientFluidChart } from '../entities/patient_fluid_chart.entity';
import { PatientFluidChartRepository } from '../repositories/patient_fluid_chart.repository';

@Injectable()
export class PatientFluidChartService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientFluidChartRepository)
        private patientFluidChartRepository: PatientFluidChartRepository,
    ) {
    }

    async getCharts(options: PaginationOptionsInterface, params): Promise<any> {
        const { patient_id } = params;

        const patient = await this.patientRepository.findOne(patient_id);

        const page = options.page - 1;

        const [result, total] = await this.patientFluidChartRepository.findAndCount({
            where: { patient },
            relations: ['patient'],
            order: { createdAt: 'ASC' },
            take: options.limit,
            skip: (page * options.limit),
        });

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async saveChart(param, createdBy) {
        const { patient_id, type, fluidRoute, volume } = param;

        const patient = await this.patientRepository.findOne(patient_id);

        const chart = new PatientFluidChart();
        chart.type = type;
        chart.fluid_route = fluidRoute;
        chart.patient = patient;
        chart.volume = volume;
        chart.createdBy = createdBy;

        return await chart.save();
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
