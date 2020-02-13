import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from '../settings/entities/role.entity';
import { CustomBaseEntity } from '../../common/entities/custom-base.entity';

@Entity({ name: 'users' })
export class User extends CustomBaseEntity {
  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, nullable: true })
  password: string;

  @Column({ nullable: true })
  lastLogin: string;

  @Column({ nullable: true, default: 0 })
  status: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  @Type(() => Role)
  role: Role;
}
