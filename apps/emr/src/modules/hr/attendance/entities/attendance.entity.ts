import { CustomBaseEntity } from 'apps/emr/src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StaffDetails } from '../../staff/entities/staff_details.entity';
import { BioDeviceUser } from './bio-device-user.entity';
import { DeviceIps } from './device.entity';

@Entity()
export class Attendance extends CustomBaseEntity {
  @ManyToOne((type) => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;

  @Column({ type: 'timestamp' })
  date: string;

  @Column()
  ip: string;

  @ManyToOne((type) => DeviceIps)
  @JoinColumn({ name: 'device_id' })
  device: DeviceIps;

  @ManyToOne((type) => BioDeviceUser, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: BioDeviceUser;
}
