import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { LabourEnrollment } from './labour_enrollment.entity';

@Entity({ name: 'labour_vitals' })
export class LabourVital extends CustomBaseEntity {
  @Column()
  fetalHeartRate: string;

  @Column()
  cervicalDialation: string;

  @Column()
  fetalHeadDescent: string;

  @Column({ nullable: true, default: true })
  isMotherAlive: boolean;

  @Column()
  numberOfContractions: string;

  @Column()
  durationOfContractions: string;

  @Column()
  bloodPressure: string;

  @Column()
  currentPulse: string;

  @Column()
  currentTemperature: string;

  @Column()
  bloodSugarLevel: string;

  @Column()
  respirationRate: string;

  @Column()
  nextAction: string;

  @ManyToOne(() => LabourEnrollment)
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: LabourEnrollment;
}
