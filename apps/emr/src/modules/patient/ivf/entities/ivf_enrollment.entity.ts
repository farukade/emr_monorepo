import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IWifeLabDetails } from '../interfaces/wifeLabDetails.interface';
import { IHusbandLabDetails } from '../interfaces/husbandLabDetails.interface';
import { Patient } from '../../entities/patient.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'ivf_enrollments' })
export class IvfEnrollment extends CustomBaseEntity {
  @Column({ nullable: true })
  serial_code: string;

  @Column('jsonb')
  wifeLabDetails: IWifeLabDetails;

  @Column('jsonb')
  husbandLabDetails: IHusbandLabDetails;

  @Column()
  prognosis: string;

  @Column({ nullable: true })
  treatmentPlan: string;

  @Column({ nullable: true })
  indication: string;

  @Column({ nullable: true })
  assessmentComments: string;

  @Column({ nullable: true })
  dateOfCommencement: string;

  @Column({ nullable: true })
  dateOfStimulation: string;

  @Column({ nullable: true })
  meducationUsed: string;

  @Column({ nullable: true })
  endometricThickness: string;

  @Column({ nullable: true })
  noOfOocyteRetrieved: string;

  @Column({ nullable: true })
  dateOfTreatment: string;

  @Column({ nullable: true })
  embryoTransferDate: string;

  @Column({ nullable: true })
  noOfEmbryoTransfer: string;

  @Column({ nullable: true })
  pregnancyTestDate: string;

  @Column({ nullable: true })
  result: string;

  @Column({ nullable: true })
  otherComments: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'wife_id' })
  wife: Patient;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'husband_id' })
  husband: Patient;

  @Column({ nullable: true })
  date_closed: string;

  @ManyToOne(() => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'closed_by' })
  closedBy: StaffDetails;

  @Column({ type: 'smallint', default: 0 })
  status: number;
}
