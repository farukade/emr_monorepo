import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'lab_test_categories' })
export class LabTestCategory extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;
}
