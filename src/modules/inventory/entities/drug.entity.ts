import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { DrugGeneric } from './drug_generic.entity';
import { DrugManufacturer } from './drug_manufacturers.entity';

@Entity({ name: 'drugs' })
export class Drug extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', length: 300 })
    code: string;

    @ManyToOne(type => DrugGeneric, item => item.drugs, { eager: true })
    @JoinColumn({ name: 'drug_generic_id' })
    generic: DrugGeneric;

    @Column({ type: 'float8', default: 0.0, name: 'base_price' })
    basePrice: number;

    @Column({ type: 'float8', default: 0.0, name: 'unit_cost' })
    unitCost: number;

    @Column({ type: 'varchar', nullable: true, name: 'unit_of_measure' })
    unitOfMeasure: string;

    @ManyToOne(type => DrugManufacturer, { nullable: true })
    @JoinColumn({ name: 'manufacturer_id' })
    manufacturer: DrugManufacturer;
}
