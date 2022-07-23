import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Biopsy } from './biopsy.entity';

@Entity({ name: 'embryo_assessment' })
export class IvfEmbryoAssessment extends CustomBaseEntity {
  @Column({ nullable: true, type: 'date' })
  date: string;

  @Column({ nullable: true })
  changeOverDoneBy: string;

  @Column({ nullable: true })
  biopsyDoneBy: string;

  @Column({ nullable: true })
  witness: string;

  @Column({ nullable: true })
  numOfClavingEmbryos: number;

  @Column({ nullable: true })
  day2Comment: string;

  @Column({ nullable: true })
  day3Comment: string;

  @OneToMany(() => Biopsy, biopsy => biopsy.assessment, { nullable: true, eager: true })
  biopsy: Biopsy[];
}
