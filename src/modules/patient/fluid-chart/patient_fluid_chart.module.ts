import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientFluidChartRepository } from '../repositories/patient_fluid_chart.repository';
import { PatientFluidChartService } from './patient_fluid_chart.service';
import { PatientFluidChartController } from './patient_fluid_chart.controller';
import { PatientRepository } from '../repositories/patient.repository';

@Module({
    imports: [TypeOrmModule.forFeature([PatientFluidChartRepository, PatientRepository])],
    controllers: [PatientFluidChartController],
    providers: [PatientFluidChartService],
})
export class PatientFluidChartModule {
}
