import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn, OneToOne } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { AntenatalEnrollment } from './antenatal-enrollment.entity';
import { PatientNote } from '../../entities/patient_note.entity';
import { Appointment } from '../../../frontdesk/appointment/appointment.entity';

@Entity({ name: 'antenatal_assessments' })
export class AntenatalAssessment extends CustomBaseEntity {
  @ManyToOne(() => AntenatalEnrollment)
  @JoinColumn({ name: 'antenatal_enrollment_id' })
  antenatalEnrolment: AntenatalEnrollment;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column('jsonb')
  measurement: any;

  @Column({ nullable: true })
  position_of_foetus: string;

  @Column({ nullable: true })
  fetal_lie: string;

  @Column({ nullable: true })
  relationship_to_brim: string;

  @Column({ nullable: true })
  next_appointment_date: string;

  @ManyToOne((type) => PatientNote, { nullable: true })
  @JoinColumn({ name: 'note_id' })
  comment: PatientNote;

  @OneToOne((type) => Appointment, (item) => item.assessment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
