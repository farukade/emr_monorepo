import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'inventory_categories' })
export class InventoryCategory extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;
}
