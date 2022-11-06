import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, Index } from 'typeorm';
import { Role } from '../../settings/entities/role.entity';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'users' })
export class User extends CustomBaseEntity {
  @Column({ length: 50 })
  @Index({ unique: true })
  username: string;

  @Column({ length: 100, nullable: true })
  password: string;

  @Column({ nullable: true })
  lastLogin: string;

  @Column({ default: false, name: 'is_logged_in' })
  isLoggedIn: boolean;

  @Column({ nullable: true, default: 0 })
  status: string;

  @Column({ nullable: true, name: 'mac_address' })
  macAddress: string;

  @Column({ default: false })
  passwordChanged: boolean;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  @Type(() => Role)
  role: Role;

  @OneToOne(() => StaffDetails, (staff) => staff.user)
  details: StaffDetails;
}
