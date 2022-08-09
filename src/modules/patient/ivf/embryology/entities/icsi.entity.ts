import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IcsiDayRecord } from './day-record.entity';

@Entity({ name: 'ivf_icsi' })
export class IvfICSIEntity extends CustomBaseEntity {
  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  mii: string;

  @Column({ nullable: true })
  migv: string;

  @Column({ nullable: true })
  frag: string;

  @Column({ nullable: true })
  abn: string;

  @Column({ nullable: true })
  icsiMethod: string;

  @Column({ nullable: true, type: 'date' })
  opDate: string;

  @Column({ nullable: true })
  docyteInjected: number;

  @Column({ nullable: true })
  docyteInseminated: number;

  @Column({ nullable: true })
  totalDocyte: number;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  oocyteComment: string;

  @Column({ nullable: true })
  witness: string;

  @ManyToOne(() => StaffDetails, { eager: true })
  @JoinColumn({ name: 'staff_id' })
  embryologist: StaffDetails;

  @OneToMany(() => IcsiDayRecord, icsi_day_record => icsi_day_record.icsi, { nullable: true, eager: true })
  icsi_day_record: IcsiDayRecord[];
}
