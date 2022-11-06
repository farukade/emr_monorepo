import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'drug_manufacturers' })
export class DrugManufacturer extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;
}
