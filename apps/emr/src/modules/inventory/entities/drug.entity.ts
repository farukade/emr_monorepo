import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { DrugGeneric } from './drug_generic.entity';
import { DrugManufacturer } from './drug_manufacturers.entity';
import { DrugBatch } from './batches.entity';

@Entity({ name: 'drugs' })
export class Drug extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300 })
  code: string;

  @ManyToOne((type) => DrugGeneric, (item) => item.drugs, { eager: true })
  @JoinColumn({ name: 'drug_generic_id' })
  generic: DrugGeneric;

  @Column({ type: 'varchar', nullable: true, name: 'unit_of_measure' })
  unitOfMeasure: string;

  @ManyToOne((type) => DrugManufacturer, { nullable: true })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: DrugManufacturer;

  @OneToMany((type) => DrugBatch, (item) => item.drug)
  batches: DrugBatch[];
}
