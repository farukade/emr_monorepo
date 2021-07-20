import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { PatientNOK } from './patient-next-of-kin.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { Transactions } from '../../finance/transactions/transaction.entity';
import { Immunization } from '../immunization/entities/immunization.entity';
import { Nicu } from '../nicu/entities/nicu.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';

@Entity({ name: 'patients' })
export class Patient extends CustomBaseEntity {

    @Column({ type: 'varchar', nullable: true, name: 'legacy_patient_id' })
    legacyPatientId: string;

    @Column({ type: 'varchar' })
    surname: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    profile_pic: string;

    @Column({ type: 'varchar' })
    other_names: string;

    @Column({ type: 'varchar', nullable: true })
    date_of_birth: string;

    @Column({ type: 'varchar', nullable: true })
    occupation: string;

    @Column({ type: 'varchar', nullable: true })
    address: string;

    @Column({ type: 'varchar', nullable: true })
    email: string;

    @Column({ type: 'varchar', nullable: true, name: 'phone_number' })
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

    @OneToOne(type => PatientNOK, { nullable: true })
    @JoinColumn({ name: 'next_of_kin_id' })
    nextOfKin: PatientNOK;

    @Column({ nullable: true, name: 'last_appointment_date' })
    lastAppointmentDate: string;

    @Column({ nullable: true, default: 0, name: 'number_of_visits' })
    noOfVisits: number;

    @ManyToOne(type => HmoScheme, { nullable: true })
    @JoinColumn({ name: 'hmo_scheme_id' })
    hmo: HmoScheme;

    @Column({ default: false, name: 'is_admitted' })
    isAdmitted: boolean;

    @Column({ default: false, name: 'is_staff' })
    isStaff: boolean;

    @Column({ type: 'float8', default: 0, name: 'credit_limit' })
    creditLimit: number;

    @Column({ nullable: true, name: 'credit_limit_expiry_date' })
    creditLimitExpiryDate: string;

    @Column({ nullable: true, name: 'blood_group' })
    bloodGroup: string;

    @Column({ nullable: true, name: 'blood_type' })
    bloodType: string;

    @Column({ default: false, name: 'is_out_patient' })
    isOpd: boolean;

    @OneToMany(type => Appointment, appointment => appointment.patient)
    appointments: Appointment[];

    @OneToMany(type => Transactions, transaction => transaction.patient)
    transactions: Transactions[];

    @OneToMany(type => Immunization, immunization => immunization.patient)
    immunization: Immunization[];

    @OneToMany(type => Nicu, nicu => nicu.patient)
    nicu: Nicu[];
}
