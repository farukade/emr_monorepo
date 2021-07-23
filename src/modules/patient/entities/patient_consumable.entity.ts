import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Patient } from './patient.entity';
import { Encounter } from '../consultation/encouter.entity';
import { StoreInventory } from '../../inventory/entities/store_inventory.entity';

@Entity({ name: 'patient_consumables' })
export class PatientConsumable extends CustomBaseEntity {

    @ManyToOne(type => StoreInventory)
    @JoinColumn({ name: 'consumable_id' })
    consumable: StoreInventory;

    @Column({ nullable: true })
    quantity: number;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Encounter, item => item.consumables, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

    @Column({ nullable: true })
    @JoinColumn({ name: 'request_note' })
    requestNote: string;

}
