import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'cafeteria_food_items' })
export class CafeteriaFoodItem extends CustomBaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'float4', default: 0 })
  price: number;

  @Column({ type: 'varchar', default: 'Show Case' })
  category: string;

  @Column({ type: 'varchar', default: 'show-case' })
  category_slug: string;

  @Column({ type: 'float4', default: 0 })
  discount_price: number;

  @Column({ type: 'float4', default: 0 })
  staff_price: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  unit: string;
}
