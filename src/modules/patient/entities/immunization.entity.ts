import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({name: 'immunizations'})
export class Immunization extends CustomBaseEntity {

    @Column()
    typeOfVaccine: string;

    @Column()
    dateOfAdministration: string;

    @Column()
    vaccineBatchNo: string;

    @Column()
    prescription: string;

    @Column()
    nextVisitDate: string;

    @ManyToOne(type => Patient)
    patient: Patient;
}
