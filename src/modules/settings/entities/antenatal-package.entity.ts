import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { AntenatalEnrollment } from '../../patient/antenatal/entities/antenatal-enrollment.entity';

@Entity({ name: 'antenatal_packages' })
export class AntenatalPackage extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string;

  @Column({ type: 'float4' })
  amount: number;

  @OneToOne(() => AntenatalEnrollment, item => item.package)
  enrolment: AntenatalEnrollment;
}
