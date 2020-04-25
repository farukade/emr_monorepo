import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Entity({name: 'immunizations'})
export class Immunization extends CustomBaseEntity {

    @Column()
    typeOfVaccine: string;

    @Column()
    dateOfAdministration: string;

    @Column()
    vaccineBatchNo: string;

    @Column('jsonb', {nullable: true})
    prescription: string;

    @Column()
    nextVisitDate: string;

    @ManyToOne(type => Patient)
    patient: Patient;

    @ManyToOne(type => StaffDetails)
    @JoinColumn({name: 'administeredBy'})
    administeredBy: StaffDetails;
}
