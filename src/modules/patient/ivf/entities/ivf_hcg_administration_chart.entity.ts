import {Entity, Column, JoinColumn, PrimaryGeneratedColumn, ManyToOne, BaseEntity} from 'typeorm';
import {IvfEnrollment} from './ivf_enrollment.entity';
import {Patient} from '../../entities/patient.entity';
import {StaffDetails} from '../../../hr/staff/entities/staff_details.entity';

@Entity({name: 'ivf_hcg_administration_charts'})
export class IvfHcgAdministrationChartEntity extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    timeOfEntry: string;

    @Column()
    timeOfAdmin: string;

    @Column()
    typeOfHcg: string;

    @Column()
    typeOfDosage: string;

    @Column()
    routeOfAdmin: string;

    @Column()
    remarks: string;

    @ManyToOne(() => IvfEnrollment)
    @JoinColumn({name: 'ivf_enrollment_id'})
    ivfEnrollment: IvfEnrollment;

    @ManyToOne(() => Patient)
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

    @ManyToOne(() => StaffDetails)
    @JoinColumn({name: 'staff_id'})
    staff: StaffDetails;

}
