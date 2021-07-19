import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Admission } from './admission.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';

@Entity({ name: 'admission_care_givers' })
export class AdmissionCareGiver extends CustomBaseEntity {

    @ManyToOne(() => StaffDetails)
    @JoinColumn({ name: 'staff_id' })
    staff: StaffDetails;

    @ManyToOne(type => Admission, admission => admission.careGivers)
    @JoinColumn({ name: 'admission_id' })
    admission: Admission;
}
