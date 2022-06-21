import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Department } from './department.entity';

@Entity({ name: 'permissions' })
export class Permission extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @ManyToOne(() => Department, { eager: true, nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Department;
}
