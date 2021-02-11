import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column, OneToOne } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Service } from '../../settings/entities/service.entity';
import { Voucher } from '../vouchers/voucher.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { PatientRequestItem } from '../../patient/entities/patient_request_items.entity';

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
    amount: number;

    @Column({ type: 'float4', nullable: true })
    voucher_amount: number;

    @Column({ type: 'float4', nullable: true })
    amount_paid: number;

    @Column({ type: 'float4', nullable: true })
    balance: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    payment_type: string;

    @Column({ nullable: true })
    transaction_type: string;

    @Column({ nullable: true })
    next_location: string;

    @Column({ type: 'smallint', default: 0 })
    status: number;

    @Column({ type: 'smallint', default: 0 })
    hmo_approval_status: number;

    @Column({ type: 'varchar', nullable: true })
    hmo_approval_code: string;

    @Column({ type: 'jsonb', nullable: true })
    transaction_details: any;

    @OneToOne(type => PatientRequestItem, { nullable: true, eager: true })
    @JoinColumn({ name: 'patient_request_item_id' })
    patientRequestItem: PatientRequestItem;
}
