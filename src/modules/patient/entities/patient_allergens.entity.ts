import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { Encounter } from '../consultation/encouter.entity';
import { DrugGeneric } from '../../inventory/entities/drug_generic.entity';

@Entity({name: 'patient_allergens'})
export class PatientAllergen extends CustomBaseEntity {

    @Column()
    category: string;

    @Column()
    allergy: string;

    @ManyToOne(type => DrugGeneric, { nullable: true })
    @JoinColumn({ name: 'drug_generic_id' })
    drugGeneric: DrugGeneric;

    @Column()
    severity: string;

    @Column()
    reaction: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Encounter, item => item.allergens, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;
}
