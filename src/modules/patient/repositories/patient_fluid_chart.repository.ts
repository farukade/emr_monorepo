import { EntityRepository, Repository } from 'typeorm';
import { PatientFluidChart } from '../entities/patient_fluid_chart.entity';

@EntityRepository(PatientFluidChart)
export class PatientFluidChartRepository extends Repository<PatientFluidChart> {}
