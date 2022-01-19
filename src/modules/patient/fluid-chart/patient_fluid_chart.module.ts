import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientFluidChartRepository } from '../repositories/patient_fluid_chart.repository';
import { PatientFluidChartService } from './patient_fluid_chart.service';
import { PatientFluidChartController } from './patient_fluid_chart.controller';
import { PatientRepository } from '../repositories/patient.repository';
import { AdmissionClinicalTaskRepository } from '../admissions/repositories/admission-clinical-tasks.repository';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { LabourEnrollmentRepository } from '../labour-management/repositories/labour-enrollment.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        PatientFluidChartRepository,
        PatientRepository,
        AdmissionClinicalTaskRepository,
        PatientVitalRepository,
        AdmissionsRepository,
        NicuRepository,
        LabourEnrollmentRepository,
    ])],
    controllers: [PatientFluidChartController],
    providers: [PatientFluidChartService],
})
export class PatientFluidChartModule {
}
