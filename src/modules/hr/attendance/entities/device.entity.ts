import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'attendance-device' })
export class DeviceIps extends CustomBaseEntity {
  @Column()
  ip: string;

  @Column({ nullable: true })
  name: string;
}
