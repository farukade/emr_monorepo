import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'roles_permissions' })
export class RolePermission extends CustomBaseEntity {

  @ManyToOne(
    type => Role,
    role => role.permissions,
  )
  @JoinColumn({ name: 'role_id' })
  public role!: Role;

  @ManyToOne(type => Permission)
  @JoinColumn({ name: 'permission_id' })
  public permission!: Permission;
}
