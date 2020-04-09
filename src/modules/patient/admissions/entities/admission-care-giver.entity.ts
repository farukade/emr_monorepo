import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Admission } from './admission.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'admission_care_givers'})
export class AdmissionCareGiver extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Admission, admission => admission.care_givers)
    admission: Admission;

    @ManyToOne(type => StaffDetails)
    staff: StaffDetails;
}