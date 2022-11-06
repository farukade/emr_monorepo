import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { PermissionCategory } from './permission-category.entity';

@Entity({ name: 'permissions' })
export class Permission extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @ManyToOne(() => PermissionCategory, { eager: true, nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: PermissionCategory;
}
