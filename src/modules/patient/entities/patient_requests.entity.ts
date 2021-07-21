import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { AdmissionClinicalTask } from '../admissions/entities/admission-clinical-task.entity';
import { PatientRequestItem } from './patient_request_items.entity';
import { IvfEnrollment } from '../ivf/entities/ivf_enrollment.entity';
import { Encounter } from '../consultation/encouter.entity';
import { AntenatalEnrollment } from '../antenatal/entities/antenatal-enrollment.entity';
import { Admission } from '../admissions/entities/admission.entity';

@Entity({ name: 'patient_requests' })
export class PatientRequest extends CustomBaseEntity {

    @Column({ nullable: true, name: 'group_code' })
    code: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({})
    requestType: string;

    @Column({ nullable: true })
    requestNote: string;

    @Column({ type: 'boolean', default: false })
    urgent: boolean;

    @Column({ type: 'smallint', default: 0 })
    status: number;

    @OneToOne(type => Admission, { nullable: true })
    @JoinColumn({ name: 'admission_id' })
    admission: Admission;

    @ManyToOne(() => Encounter, item => item.requests, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

    @ManyToOne(type => IvfEnrollment, { nullable: true })
    @JoinColumn({ name: 'ivf_id' })
    ivf: IvfEnrollment;

    @Column({ nullable: true, name: 'procedure_id' })
    procedure: number;

    @ManyToOne(() => AntenatalEnrollment, { nullable: true })
    @JoinColumn({ name: 'antenatal_id' })
    antenatal: AntenatalEnrollment;

    @OneToMany(type => AdmissionClinicalTask, task => task.request)
    task: AdmissionClinicalTask;

    @OneToOne(type => PatientRequestItem, item => item.request)
    item: PatientRequestItem;
}
