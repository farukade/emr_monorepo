import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { AdmissionClinicalTask } from '../admissions/entities/admission-clinical-task.entity';
import { PatientRequestItem } from './patient_request_items.entity';
import { IvfEnrollment } from '../ivf/entities/ivf_enrollment.entity';

@Entity({name: 'patient_requests'})
export class PatientRequest extends CustomBaseEntity {

    @Column({ nullable: true })
    code: string;

    @Column()
    requestType: string;

    @Column({ nullable: true })
    requestNote: string;

    @Column({ type: 'boolean', default: false })
    isFilled: boolean;

    @Column({ type: 'boolean', default: false })
    urgent: boolean;

    @ManyToOne(type => Patient)
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

    @Column({type: 'smallint', default: 0})
    status: number;

    @OneToMany(type => AdmissionClinicalTask, task => task.request)
    task: AdmissionClinicalTask;

    @OneToMany(type => PatientRequestItem, items => items.request)
    items: PatientRequestItem[];

    @ManyToOne(type => IvfEnrollment)
    @JoinColumn({name: 'ivf_id'})
    ivf: IvfEnrollment;
}
