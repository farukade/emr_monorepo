import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IvfEmbryoTransfer } from './embryo-transfer.entity';

@Entity({ name: 'ivf_embryo_transfer_record' })
export class IvfEmbryoTransferRecord {
  @PrimaryGeneratedColumn()
  id: number;

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
}
