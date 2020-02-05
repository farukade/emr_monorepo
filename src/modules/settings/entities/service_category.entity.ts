import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Service } from './service.entity';

@Entity({ name: 'service_categories' })
export class ServiceCategory extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

  @OneToMany(
    () => Service,
    service => service.category,
    { onDelete: 'CASCADE' },
  )
  services: Service[];
}
