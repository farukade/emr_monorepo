import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../staff/entities/staff_details.entity';
import { LeaveCategory } from '../../../settings/entities/leave.category.entity';
import { Diagnosis } from '../../../settings/entities/diagnosis.entity';

@Entity({ name: 'leave_applications' })
export class Leave extends CustomBaseEntity {
  @ManyToOne(() => StaffDetails)
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;

  @ManyToOne((type) => LeaveCategory)
  @JoinColumn({ name: 'leave_category_id' })
  category: LeaveCategory;

  @Column({ type: 'varchar' })
  start_date: string;

  @Column({ type: 'varchar' })
  end_date: string;

  @Column({ type: 'varchar' })
  application: string;

  @Column({ type: 'varchar', nullable: true })
  comment: string;

  @Column({ default: 0 })
  status: number;

  @Column({ default: 'leave' })
  leave_type: string;

  @ManyToOne((type) => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'applied_by' })
  appliedBy: StaffDetails;

  @ManyToOne((type) => Diagnosis, { nullable: true })
  @JoinColumn({ name: 'diagnosis_id' })
  diagnosis: Diagnosis;

  @Column({ nullable: true })
  approved_by: string;

  @Column({ nullable: true })
  approved_at: string;

  @Column({ nullable: true })
  declined_by: string;

  @Column({ nullable: true })
  declined_at: string;

  @Column({ nullable: true })
  decline_reason: string;
}
