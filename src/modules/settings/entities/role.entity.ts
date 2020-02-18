import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { RolePermission } from './role_permission.entity';

@Entity({ name: 'roles' })
export class Role extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  slug: string;

  @OneToMany(
    () => RolePermission,
    rolePermission => rolePermission.role,
    { onDelete: 'CASCADE' },
  )
  permissions: RolePermission[];
}
