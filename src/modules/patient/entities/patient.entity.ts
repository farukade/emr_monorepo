import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { PatientNOK } from './patient-next-of-kin.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';
import { Transactions } from '../../finance/transactions/transaction.entity';
import { Immunization } from '../immunization/entities/immunization.entity';
import { Nicu } from '../nicu/entities/nicu.entity';

@Entity({ name: 'patients' })
export class Patient extends CustomBaseEntity {

    @Column({ type: 'varchar', nullable: true })
    folderNumber: string;

    @Column({ type: 'varchar' })
    surname: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    profile_pic: string;

    @Column({ type: 'varchar' })
    other_names: string;

    @Column({ type: 'varchar' })
    date_of_birth: string;

    @Column({ type: 'varchar', nullable: true })
    occupation: string;

    @Column({ type: 'varchar', nullable: true })
    address: string;

    @Column({ type: 'varchar', nullable: true })
    email: string;

    @Column({ type: 'varchar' })
    phoneNumber: string;

    @Column({ default: false })
    deceased: boolean;

    @Column({ type: 'varchar' })
    gender: string;

    @Column({ type: 'varchar', nullable: true })
    maritalStatus: string;

    @Column({ type: 'varchar', nullable: true })
    ethnicity: string;

    @Column({ type: 'varchar', nullable: true })
    referredBy: string;

    @OneToOne(type => PatientNOK, { cascade: true, nullable: true })
    @JoinColumn()
    nextOfKin?: PatientNOK;

    @Column({ nullable: true })
    lastAppointmentDate: string;

    @Column({ nullable: true, default: 0 })
    noOfVisits: number;

    @OneToMany(type => Appointment, appointment => appointment.patient)
    appointments: Appointment[];

    @OneToMany(type => Transactions, transaction => transaction.patient)
    transactions: Transactions[];

    @OneToMany(type => Immunization, immunization => immunization.patient)
    immunization: Immunization[];

    @OneToMany(type => Nicu, nicu => nicu.patient)
    nicu: Nicu[];

    @ManyToOne(() => Hmo)
    @JoinColumn({ name: 'hmo_id' })
    hmo: Hmo;

    @Column({ default: false })
    isAdmitted: boolean;

    @Column({ default: false })
    isStaff: boolean;

    @Column({ type: 'float8', default: 0, name: 'credit_limit' })
    creditLimit: number;

    @Column({ nullable: true, name: 'credit_limit_expiry_date' })
    creditLimitExpiryDate: string;
}
