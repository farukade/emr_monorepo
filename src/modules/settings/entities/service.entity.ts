import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { ServiceCategory } from './service_category.entity';

@Entity({ name: 'services' })
export class Service extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  tariff: string;

  @ManyToOne(
    () => ServiceCategory,
    category => category.services,
  )
  @JoinColumn({ name: 'service_category_id' })
  @Type(() => ServiceCategory)
  category?: ServiceCategory;
}
