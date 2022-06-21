import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../staff/entities/staff_details.entity';
import { PerformanceAppraisalPeriod } from './performance_appraisal_period.entity';

@Entity({ name: 'supervisor_evaluation_reports' })
export class AppraisalEvaluation extends CustomBaseEntity {
  @Column()
  sectionTitle: string;

  @Column({ type: 'json' })
  answers: string;

  @ManyToOne(() => StaffDetails)
  @JoinColumn({ name: 'staff_id' })
  supervisor: StaffDetails;

  @ManyToOne(() => PerformanceAppraisalPeriod)
  period: PerformanceAppraisalPeriod;

  @ManyToOne(() => StaffDetails)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: StaffDetails;

  @Column()
  evaluatorComment: string;
}
