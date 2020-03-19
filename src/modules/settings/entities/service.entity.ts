import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { ServiceSubCategory } from './service_sub_category.entity';
import { ServiceCategory } from './service_category.entity';

@Entity({ name: 'services' })
export class Service extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  tariff: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  discount: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  gracePeriod: string;

  @Column({ nullable: true })
  noOfVisits: number;

  @Column({type: 'varchar', length: 20, default: 0})
  code: string;

  @ManyToOne(type => ServiceSubCategory)
  @JoinColumn({ name: 'sub_category_id' })
  public subCategory!: ServiceSubCategory;

  @ManyToOne(type => ServiceCategory, {nullable: true})
  @JoinColumn({ name: 'category_id' })
  public category!: ServiceCategory;
}
