import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientFluidChartRepository } from '../repositories/patient_fluid_chart.repository';
import { PatientFluidChartService } from './patient_fluid_chart.service';
import { PatientFluidChartController } from './patient_fluid_chart.controller';
import { PatientRepository } from '../repositories/patient.repository';
import { AdmissionClinicalTaskRepository } from '../admissions/repositories/admission-clinical-tasks.repository';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        PatientFluidChartRepository,
        PatientRepository,
        AdmissionClinicalTaskRepository,
        PatientVitalRepository,
    ])],
    controllers: [PatientFluidChartController],
    providers: [PatientFluidChartService],
})
export class PatientFluidChartModule {
}
