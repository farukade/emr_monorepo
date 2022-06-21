import { Entity, ManyToOne, JoinColumn, OneToOne, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Patient } from '../../entities/patient.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'patient_care_teams' })
export class CareTeam extends CustomBaseEntity {
  @ManyToOne(() => StaffDetails)
  @JoinColumn({ name: 'care_giver_id' })
  member: StaffDetails;

  @Column({ default: false })
  is_primary_care_giver: boolean;

  @Column()
  type: string;

  @Column({ nullable: true })
  item_id: string;

  @ManyToOne((type) => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
