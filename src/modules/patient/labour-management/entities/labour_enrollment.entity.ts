import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../entities/patient.entity';

@Entity({name: 'labour_enrollemnts'})
export class LabourEnrollment extends CustomBaseEntity {

    @Column()
    husbandName: string;

    @Column()
    husbandPhoneNo: string;

    @Column({nullable: true})
    bloodGroup: string;

    @Column({nullable: true})
    parity: string;

    @Column({nullable: true})
    alive: string;

    @Column({nullable: true})
    miscarriage: string;

    @Column({nullable: true})
    presentPregnancy: string;

    @Column({nullable: true})
    lmp: string;

    @ManyToOne(type => Patient)
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

}
