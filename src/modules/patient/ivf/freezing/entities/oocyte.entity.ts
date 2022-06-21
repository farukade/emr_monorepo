import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SpermOocyteDonor } from './donor.entity';

@Entity({ name: 'oocyte_emb' })
export class OocyteEntity extends CustomBaseEntity {
  @Column({ nullable: true, type: 'date' })
  date: string;

  @Column({ nullable: true })
  numOfOocyte: number;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  numOfStems: number;

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
