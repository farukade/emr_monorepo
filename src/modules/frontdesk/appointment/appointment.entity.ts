import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column, OneToOne } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';
import { Service } from '../../settings/entities/service.entity';
import { ServiceCategory } from '../../settings/entities/service_category.entity';
import {Encounter} from '../../patient/consultation/encouter.entity';
import {StaffDetails} from '../../hr/staff/entities/staff_details.entity';
import {Transactions} from '../../finance/transactions/transaction.entity';
import { Department } from '../../settings/entities/department.entity';

@Entity({ name: 'appointments'})
export class Appointment extends CustomBaseEntity {

    @ManyToOne(
        () => Patient,
        patient => patient.appointments,
    )
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

    @ManyToOne(type => Department, {nullable: true})
    @JoinColumn({ name: 'department_id'})
    department: Department;

    @ManyToOne(type => StaffDetails)
    @JoinColumn({ name: 'doctor_id'})
    whomToSee: StaffDetails;

    @ManyToOne(type => ConsultingRoom, {nullable: true})
    @JoinColumn({ name: 'consulting_room_id'})
    consultingRoom: ConsultingRoom;

    @ManyToOne(type => ServiceCategory, {nullable: true})
    @JoinColumn({ name: 'service_category_id'})
    serviceCategory: ServiceCategory;

    @ManyToOne(type => Service, {nullable: true})
    @JoinColumn({ name: 'service_id'})
    serviceType: Service;

    @Column({ nullable: true})
    duration: string;

    @Column({ nullable: true})
    appointment_date: string;

    @Column({ nullable: true })
    referredBy: string;

    @Column({ nullable: true })
    referralCompany: string;

    @Column({nullable: true})
    description: string;

    @Column({type: 'varchar', default: 'Pending'})
    status: string;

    @Column({type: 'varchar', default: 'patient'})
    appointmentType: string;

    @Column({type: 'smallint', default: 0})
    doctorStatus: number;

    @Column({type: 'smallint', default: 0})
    canSeeDoctor: number;

    @Column({type: 'float4', default: 0})
    amountToPay: string;

    @OneToOne(type => Encounter)
    @JoinColumn()
    encounter: Encounter;

    @OneToOne(type => Transactions, { nullable: true })
    @JoinColumn({name: 'transaction_id'})
    transaction: Transactions;
}
