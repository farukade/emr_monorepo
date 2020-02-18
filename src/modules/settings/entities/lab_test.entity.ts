import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTestParameter } from './lab_test_parameter.entity';
import { LabTestCategory } from './lab_test_category.entity';

@Entity({ name: 'lab_tests' })
export class LabTest extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 300})
  price: string;

  @Column({ type: 'varchar'})
  test_type: string;

  @Column({type: 'varchar', nullable: true})
  description: string;

  @ManyToOne(type => LabTestCategory)
  @JoinColumn({ name: 'lab_test_category_id' })
  public category!: LabTestCategory;

  @OneToMany(
    () => LabTestParameter,
    labTestParameter => labTestParameter.labTest,
    { eager: true, onDelete: 'CASCADE' },
  )
  parameters: LabTestParameter[];
}
