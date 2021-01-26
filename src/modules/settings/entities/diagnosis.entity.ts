import { Type } from 'class-transformer';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'diagnosis' })
export class Diagnosis extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  procedureCode: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  icd10Code: string;

  @Column({ type: 'varchar', length: 300 })
  description: string;

  @Column({ type: 'varchar', default: 10 })
  diagnosisType: string;

}
