import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { InventorySubCategory } from './inventory.sub-category.entity';
import { InventoryCategory } from './inventory.category.entity';
import { Vendor } from '../vendor/vendor.entity';

@Entity({ name: 'stocks' })
export class Stock extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  generic_name: string;

  @Column({ type: 'varchar', nullable: true})
  stock_code: string;

  @Column({ type: 'varchar', nullable: true})
  description: string;

  @Column({ type: 'varchar', nullable: true})
  cost_price: string;

  @Column({ type: 'varchar', nullable: true})
  sales_price: string;

  @Column({ type: 'integer', default: 0})
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  expiry_date: string;

  @ManyToOne(type => InventorySubCategory, { nullable: true })
  @JoinColumn({ name: 'sub_category_id' })
  public subCategory!: InventorySubCategory;

  @ManyToOne(type => InventoryCategory)
  @JoinColumn({ name: 'category_id' })
  public category!: InventoryCategory;

  @ManyToOne(type => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  public vendor!: Vendor;
}
