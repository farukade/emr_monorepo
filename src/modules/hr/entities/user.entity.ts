import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Role } from '../../settings/entities/role.entity';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { StaffDetails } from '../staff/entities/staff_details.entity';

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

  @OneToOne(type => StaffDetails, { cascade: true})
  details: StaffDetails;
}
