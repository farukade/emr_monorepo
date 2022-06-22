import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SpermOocyteDonor } from './donor.entity';

@Entity({ name: 'sperm_emb' })
export class SpermEntity extends CustomBaseEntity {
  @Column({ nullable: true, type: 'date' })
  date: string;

  @Column({ nullable: true })
  timeDelivered: string;

  @Column({ nullable: true })
  timeFrozen: string;

  @Column({ nullable: true })
  cone: string;

  @Column({ nullable: true })
  numOfVials: number;

  @Column({ nullable: true })
  dewar: number;

  @Column({ nullable: true })
  position: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  mediaUsed: string;

  @OneToOne(() => SpermOocyteDonor, { eager: true })
  @JoinColumn({ name: 'sperm_oocyte_donor' })
  donor: SpermOocyteDonor;
}
