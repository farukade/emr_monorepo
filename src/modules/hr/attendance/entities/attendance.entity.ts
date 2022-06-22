import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AttendanceStaff } from './attendance-staff.entity';
import { DeviceIps } from './device.entity';

@Entity()
export class Attendance extends CustomBaseEntity {
  @ManyToOne((type) => AttendanceStaff)
  @JoinColumn({ name: 'staff_id' })
  staff: AttendanceStaff;

  @Column({ type: 'timestamp' })
  date: string;

  @Column()
  userDeviceId: number;

  @Column()
  ip: string;

  @ManyToOne((type) => DeviceIps)
  @JoinColumn({ name: 'device_id' })
  device: DeviceIps;
}
