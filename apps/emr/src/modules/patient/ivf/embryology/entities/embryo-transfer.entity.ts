import { CustomBaseEntity } from 'apps/emr/src/common/entities/custom-base.entity';
import { StaffDetails } from 'apps/emr/src/modules/hr/staff/entities/staff_details.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IvfEmbryoTransferRecord } from './embryo-trans-record.entity';

@Entity({ name: 'ivf_embryo_transfer' })
export class IvfEmbryoTransfer extends CustomBaseEntity {
  @Column({ nullable: true })
  nameOfEmbryoTransfered: string;

  @Column({ nullable: true })
  numOfEmbryoTransfered: number;

  @Column({ nullable: true, type: 'date' })
  dateOfEmbryoTransfered: string;

  @Column({ nullable: true })
  dr: string;

  @Column({ nullable: true, type: 'date' })
  date: string;

  @Column({ nullable: true })
  numOfEmbryoVit: number;

  @Column({ nullable: true })
  numOfStraws: number;

  @ManyToOne(() => StaffDetails, { eager: true })
  @JoinColumn({ name: 'staff_id' })
  embryologist: StaffDetails;

  @OneToMany(() => IvfEmbryoTransferRecord, trans_record => trans_record.ivf_transfer, { nullable: true, eager: true })
  trans_record: IvfEmbryoTransferRecord[];

}
