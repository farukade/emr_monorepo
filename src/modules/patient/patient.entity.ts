import { CustomBaseEntity } from '../../common/entities/custom-base.entity';
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { PatientNOK } from './patient-next-of-kin.entity';
import { Appointment } from '../frontdesk/appointment/appointment.entity';

@Entity({ name: 'patients' })
export class Patient extends CustomBaseEntity {

    @Column({ type: 'varchar'})
    fileNumber: string;

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

    @Column({ type: 'varchar'})
    insurranceStatus: string;

    @Column({ type: 'varchar', nullable: true})
    ethnicity: string;

    @Column({ type: 'varchar', nullable: true})
    referredBy: string;

    @OneToOne(type => PatientNOK, { cascade: true })
    @JoinColumn()
    nextOfKin: PatientNOK;

    @OneToMany(type => Appointment, appointment => appointment.patient)
    appointments!: Appointment;
}