import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { PatientRequestItem } from './patient_request_items.entity';

@Entity({ name: 'patient_documents' })
export class PatientDocument extends CustomBaseEntity {
  @Column()
  document_type: string;

  @Column()
  document_name: string;

  @ManyToOne((type) => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToOne((type) => PatientRequestItem, (item) => item.document)
  item: PatientRequestItem;

  @Column({ nullable: true })
  cloud_uri: string;
}
