import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { InventoryCategory } from './inventory.category.entity';

@Entity({ name: 'inventory_sub_categories' })
export class InventorySubCategory extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

  @ManyToOne(type => InventoryCategory)
  @JoinColumn({ name: 'inventory_category_id' })
  public category!: InventoryCategory;
}
