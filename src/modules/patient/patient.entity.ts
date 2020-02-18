import { CustomBaseEntity } from '../../common/entities/custom-base.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { PatientNOK } from './patient-next-of-kin.entity';

@Entity({ name: 'patients' })
export class Patient extends CustomBaseEntity {

    @Column({ type: 'varchar'})
    surname: string;

    @Column({ type: 'varchar'})
    other_names: string;

    @Column({ type: 'varchar'})
    date_of_birth: string;

    @Column({ type: 'varchar', nullable: true})
    occupation: string;

    @Column({ type: 'varchar'})
    address: string;

    @Column({ type: 'varchar', nullable: true})
    email: string;

    @Column({ type: 'varchar'})
    phoneNumber: string;

    @Column({ type: 'varchar'})
    gender: string;

    @Column({ type: 'varchar', nullable: true})
    maritalStatus: string;

    @Column({ type: 'varchar', nullable: true})
    ethnicity: string;

    @Column({ type: 'varchar', nullable: true})
    referredBy: string;

    @OneToOne(type => PatientNOK)
    @JoinColumn()
    nextOfKin: PatientNOK;
}