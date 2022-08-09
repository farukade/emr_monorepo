import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CellInfo } from './cell-info.entity';

@Entity({ name: 'ivf_sperm_preparation' })
export class IvfSpermPreparationEntity extends CustomBaseEntity {
  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  donorCode: string;

  @Column({ nullable: true })
  viscousity: string;

  @Column({ nullable: true })
  timeOfProduction: string;

  @Column({ nullable: true })
  timeReceived: string;

  @Column({ nullable: true })
  timeAnalyzed: string;

  @Column({ nullable: true })
  witness: string;

  @ManyToOne(() => StaffDetails, { eager: true })
  @JoinColumn({ name: 'staff_id' })
  embryologist: StaffDetails;

  @OneToMany(() => CellInfo, cell_info => cell_info.sperm_prep, { eager: true })
  cell_info: CellInfo[];
}
