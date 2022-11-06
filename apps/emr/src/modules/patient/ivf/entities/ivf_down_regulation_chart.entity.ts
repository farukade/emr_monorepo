import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { DownRegulationChartInterface } from '../interfaces/down-requlation-chart.interface';
import { IvfEnrollment } from './ivf_enrollment.entity';

@Entity({ name: 'ivf_down_regulation_charts' })
export class IvfDownRegulationChartEntity extends CustomBaseEntity {
  @OneToOne(() => IvfEnrollment)
  @JoinColumn({ name: 'ivf_enrollment_id' })
  ivfEnrollment: IvfEnrollment;

  @Column()
  agent: string;

  @Column()
  cycle: string;

  @Column('simple-json')
  charts: DownRegulationChartInterface[];
}
