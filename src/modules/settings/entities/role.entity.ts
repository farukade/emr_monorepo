import {Column, Entity, JoinTable, ManyToMany, OneToMany} from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import {Permission} from './permission.entity';

@Entity({ name: 'roles' })
export class Role extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  slug: string;

  @ManyToMany(type => Permission)
  @JoinTable()
  permissions: Permission[];
}
