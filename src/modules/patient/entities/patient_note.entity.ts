import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Patient } from './patient.entity';
import { Encounter } from '../consultation/encouter.entity';
import { Admission } from '../admissions/entities/admission.entity';
import { PatientRequestItem } from './patient_request_items.entity';
import { DrugGeneric } from '../../inventory/entities/drug_generic.entity';
import { IvfEnrollment } from '../ivf/entities/ivf_enrollment.entity';
import { AntenatalEnrollment } from '../antenatal/entities/antenatal-enrollment.entity';
import { LabourEnrollment } from '../labour-management/entities/labour_enrollment.entity';

@Entity({ name: 'patient_notes' })
export class PatientNote extends CustomBaseEntity {

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'jsonb', nullable: true })
    diagnosis: any;

    @Column({ type: 'jsonb', nullable: true })
    history: any;

    @Column({ type: 'text', nullable: true })
    category: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true, name: 'diagnosis_type' })
    diagnosisType: string;

    @Column({ nullable: true })
    comment: string;

    @Column({ nullable: true })
    specialty: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(type => Admission, { nullable: true })
    @JoinColumn({ name: 'admission_id' })
    admission: Admission;

    @ManyToOne(() => PatientRequestItem, { nullable: true })
    @JoinColumn({ name: 'request_item_id' })
    request: PatientRequestItem;

    @ManyToOne(() => Encounter, item => item.notes, { nullable: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

    @Column({ type: 'varchar', default: 'Active' })
    status: string;

    @Column({ nullable: true })
    allergy: string;

    @ManyToOne(type => DrugGeneric, { nullable: true })
    @JoinColumn({ name: 'drug_generic_id' })
    drugGeneric: DrugGeneric;

    @Column({ nullable: true })
    severity: string;

    @Column({ nullable: true })
    reaction: string;

    @Column({ nullable: true })
    visit: string;

    @Column({ nullable: true, name: 'note_type' })
    noteType: string;

    @ManyToOne(type => IvfEnrollment, { nullable: true })
    @JoinColumn({ name: 'ivf_id' })
    ivf: IvfEnrollment;

    @ManyToOne(type => AntenatalEnrollment, { nullable: true })
    @JoinColumn({ name: 'antenatal_id' })
    antenatal: AntenatalEnrollment;

    @ManyToOne(type => LabourEnrollment, { nullable: true })
    @JoinColumn({ name: 'labour_id' })
    labour: LabourEnrollment;

}
