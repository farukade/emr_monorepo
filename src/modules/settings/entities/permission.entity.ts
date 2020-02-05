import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { RolePermission } from './role_permission.entity';

@Entity({ name: 'permissions' })
export class Permission extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

  @OneToMany(
    () => RolePermission,
    rolePermission => rolePermission.permission,
    { onDelete: 'CASCADE' },
  )
  roles: RolePermission[];
}
