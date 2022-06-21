import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { IvfEmbryoAssessment } from './entities/embryo-assessment.entity';
import { IvfEmbryoTransfer } from './entities/embryo-transfer.entity';
import { IvfICSIEntity } from './entities/icsi.entity';
import { IvfSpermPreparationEntity } from './entities/sperm-prep.entity';
import { IvfTreatmentEntity } from './entities/treatment.entity';

@Entity({ name: 'ivf_embryology' })
export class IvfEmbryologyEntity extends CustomBaseEntity {
  @ManyToOne((type) => Patient, (patient) => patient.embryology)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToOne(() => IvfEmbryoAssessment, { eager: true })
  @JoinColumn({ name: 'ivf_embryo_assessment_id' })
  embryoAssessment: IvfEmbryoAssessment;

  @OneToOne(() => IvfEmbryoTransfer, { eager: true })
  @JoinColumn({ name: 'ivf_embryo_transfer_id' })
  embryoTransfer: IvfEmbryoTransfer;

  @OneToOne(() => IvfICSIEntity, { eager: true })
  @JoinColumn({ name: 'ivf_icsi_id' })
  icsi: IvfICSIEntity;

  @OneToOne(() => IvfSpermPreparationEntity, { eager: true })
  @JoinColumn({ name: 'ivf_sperm_preparation_id' })
  spermPreparation: IvfSpermPreparationEntity;

  @OneToOne(() => IvfTreatmentEntity, { eager: true })
  @JoinColumn({ name: 'ivf_treatment_id' })
  ivfTreatment: IvfTreatmentEntity;

  @Column({ nullable: true, default: false })
  isSubmitted: boolean;
}
