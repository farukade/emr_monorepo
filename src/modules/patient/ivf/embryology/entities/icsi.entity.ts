import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ivf_icsi' })
export class IvfICSIEntity {
  @PrimaryGeneratedColumn()
  id: number;

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
  witness: string;

  @ManyToOne(() => StaffDetails, (staff) => staff.transactions, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  embryologist: StaffDetails;
}
