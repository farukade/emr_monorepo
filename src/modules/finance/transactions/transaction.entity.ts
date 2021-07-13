import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column, OneToOne } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Service } from '../../settings/entities/service.entity';
import { Voucher } from '../vouchers/voucher.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { PatientRequestItem } from '../../patient/entities/patient_request_items.entity';
import { PatientRequest } from '../../patient/entities/patient_requests.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';

@Entity({ name: 'transactions' })
export class Transactions extends CustomBaseEntity {

    @ManyToOne(
        () => Patient,
        patient => patient.transactions,
        { nullable: true },
    )
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(
        () => StaffDetails,
        staff => staff.transactions,
        { nullable: true },
    )
    @JoinColumn({ name: 'staff_id' })
    staff: StaffDetails;

    @ManyToOne(type => Service, { nullable: true })
    @JoinColumn({ name: 'service_id' })
    serviceType: Service;

    @ManyToOne(type => Voucher, { nullable: true })
    @JoinColumn({ name: 'voucher_id' })
    voucher: Voucher;

    @Column({ type: 'float4', nullable: true })
    sub_total: number;

    @Column({ type: 'float4', nullable: true })
    vat: number;

    @Column({ type: 'float4', nullable: true })
    amount: number;

    @Column({ type: 'float4', nullable: true })
    voucher_amount: number;

    @Column({ type: 'float4', nullable: true })
    amount_paid: number;

    @Column({ type: 'float4', nullable: true })
    balance: number;

    @Column({ type: 'float4', nullable: true })
    remaining: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    payment_type: string;

    @Column({ nullable: true })
    part_payment_expiry_date: string;

    @Column({ default: false })
    is_admitted: string;

    @Column({ nullable: true })
    transaction_type: string;

    @Column({ nullable: true })
    next_location: string;

    @Column({ type: 'smallint', default: 0 })
    status: number;

    @Column({ type: 'varchar', nullable: true })
    hmo_approval_code: string;

    @Column({ type: 'jsonb', nullable: true })
    transaction_details: any;

    @ManyToOne(type => PatientRequestItem, item => item.transaction, { nullable: true, eager: true })
    @JoinColumn({ name: 'patient_request_item_id' })
    patientRequestItem: PatientRequestItem;

    @ManyToOne(type => PatientRequest, { nullable: true })
    @JoinColumn({ name: 'patient_request_id' })
    request: PatientRequest;

    @ManyToOne(type => Appointment, { nullable: true })
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;

    @ManyToOne(() => Hmo, { nullable: true })
    @JoinColumn({ name: 'hmo_id' })
    hmo: Hmo;
}
