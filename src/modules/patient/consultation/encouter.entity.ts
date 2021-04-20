import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientRequest } from '../entities/patient_requests.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { PatientDiagnosis } from '../entities/patient_diagnosis.entity';
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { PatientAllergen } from '../entities/patient_allergens.entity';
import { PatientNote } from '../entities/patient_note.entity';
import { PatientHistory } from '../entities/patient_history.entity';
import { PatientPastDiagnosis } from '../entities/patient_past_diagnosis.entity';
import { PatientPhysicalExam } from '../entities/patient_physical_exam.entity';

@Entity({ name: 'encounters' })
export class Encounter extends CustomBaseEntity {

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @OneToOne(type => Appointment, item => item.encounter)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;

    @OneToMany(() => PatientNote, item => item.encounter)
    notes: PatientNote[];

    @OneToMany(() => PatientHistory, item => item.encounter)
    history: PatientHistory[];

    @OneToMany(() => PatientDiagnosis, item => item.encounter)
    diagnoses: PatientDiagnosis[];

    @OneToMany(() => PatientPastDiagnosis, item => item.encounter)
    pastDiagnoses: PatientPastDiagnosis[];

    @OneToMany(() => PatientAllergen, item => item.encounter)
    allergens: PatientAllergen[];

    @OneToMany(() => PatientPhysicalExam, item => item.encounter)
    physicalExams: PatientPhysicalExam[];

    @OneToMany(() => PatientRequest, item => item.encounter)
    requests: PatientRequest[];

    @OneToMany(() => PatientConsumable, item => item.encounter)
    consumables: PatientConsumable[];
}
