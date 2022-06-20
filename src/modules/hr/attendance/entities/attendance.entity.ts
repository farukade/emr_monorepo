import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Attendance extends CustomBaseEntity {
  @ManyToOne((type) => StaffDetails)
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;

  @Column({ type: 'timestamp' })
  date: string;

  @Column()
  userDeviceId: number;

  @Column()
  ip: string;
}
