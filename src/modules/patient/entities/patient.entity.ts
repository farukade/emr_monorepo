import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { PatientNOK } from './patient-next-of-kin.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { Hmo } from '../../hmo/hmo.entity';
import { Transactions } from '../../finance/transactions/transaction.entity';

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

    @Column({ type: 'varchar', nullable: true})
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
    insurranceStatus: string;

    @Column({ type: 'varchar', nullable: true})
    ethnicity: string;

    @Column({ type: 'varchar', nullable: true})
    referredBy: string;

    @Column({ type: 'varchar', nullable: true, default: 'in-patient'})
    patientType: string;

    @OneToOne(type => PatientNOK, { cascade: true })
    @JoinColumn()
    nextOfKin?: PatientNOK;

    @Column({ nullable: true })
    lastAppointmentDate: string;

    @Column({ nullable: true, default: 0 })
    noOfVisits: number;

    @OneToMany(type => Appointment, appointment => appointment.patient)
    appointments: Appointment;

    @OneToMany(type => Transactions, transaction => transaction.patient)
    transactions: Transactions;

    @ManyToOne(() => Hmo, {nullable: true})
    hmo?: Hmo;

    @Column({ default: false })
    isAdmitted: boolean;
}
