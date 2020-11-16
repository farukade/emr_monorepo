import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { ServiceSubCategory } from './service_sub_category.entity';
import { ServiceCategory } from './service_category.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';

@Entity({ name: 'services' })
export class Service extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  tariff: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  discount: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  note: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  gracePeriod: string;

  @Column({ nullable: true })
  noOfVisits: number;

  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @Column({type: 'varchar', nullable: true})
  hmoTarrif: string;

  @ManyToOne(type => ServiceSubCategory)
  @JoinColumn({ name: 'sub_category_id' })
  public subCategory!: ServiceSubCategory;

  @ManyToOne(type => ServiceCategory, {nullable: true})
  @JoinColumn({ name: 'category_id' })
  public category!: ServiceCategory;

  @ManyToOne(type => Hmo, {nullable: true})
  @JoinColumn({ name: 'hmo_id' })
  public hmo!: Hmo;
}
