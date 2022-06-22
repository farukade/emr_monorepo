import { IsNotEmpty } from 'class-validator';
import { DownRegulationChartInterface } from '../interfaces/down-requlation-chart.interface';

export class IvfDownRegulationChartDto {
  @IsNotEmpty()
  ivf_enrollment_id: string;
  agent: string;
  cycle: string;
  charts: DownRegulationChartInterface[];
}
