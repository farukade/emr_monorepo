import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientRequest } from '../entities/patient_requests.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { PatientNote } from '../entities/patient_note.entity';

@Entity({ name: 'encounters' })
export class Encounter extends CustomBaseEntity {
  @ManyToOne((type) => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToOne((type) => Appointment, (item) => item.encounter, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @OneToMany(() => PatientNote, (item) => item.encounter)
  notes: PatientNote[];

  @OneToMany(() => PatientRequest, (item) => item.encounter)
  requests: PatientRequest[];

  @OneToMany(() => PatientConsumable, (item) => item.encounter)
  consumables: PatientConsumable[];
}
