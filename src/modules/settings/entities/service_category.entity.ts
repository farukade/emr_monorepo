import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Service } from './service.entity';
import { ServiceSubCategory } from './service_sub_category.entity';

@Entity({ name: 'service_categories' })
export class ServiceCategory extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @OneToMany(
    () => ServiceSubCategory,
    subCateogries => subCateogries.category,
    { onDelete: 'CASCADE' },
  )
  subCateogries: ServiceSubCategory[];

  @OneToMany(
    () => Service,
    service => service.subCategory,
    { onDelete: 'CASCADE' },
  )
  services: Service[];
}
