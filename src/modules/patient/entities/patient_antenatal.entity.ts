import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'patient_antenatals' })
export class PatientAntenatal extends CustomBaseEntity {
  @Column()
  heightOfFunds: string;

  @Column()
  fetalHeartRate: string;

  @Column()
  positionOfFetus: string;

  @Column()
  fetalLie: string;

  @Column()
  relationshipToBrim: string;

  @ManyToOne((type) => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
