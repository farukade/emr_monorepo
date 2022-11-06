import { CustomBaseEntity } from 'apps/emr/src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IvfEmbryoTransfer } from './embryo-transfer.entity';

@Entity({ name: 'ivf_embryo_transfer_record' })
export class IvfEmbryoTransferRecord extends CustomBaseEntity {
  @Column({ nullable: true })
  stage: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  comments: string;

  @Column({ nullable: true })
  icsi: string;

  @Column({ nullable: true })
  ivf: string;

  @ManyToOne(() => IvfEmbryoTransfer, ivf_transfer => ivf_transfer.trans_record)
  @JoinColumn({ name: 'ivf_transfer_id' })
  ivf_transfer: IvfEmbryoTransfer;

}
