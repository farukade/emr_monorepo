import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Department } from '../../settings/entities/department.entity';
import { Service } from '../../settings/entities/service.entity';
import { Voucher } from '../vouchers/voucher.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { TransactionItems } from './transaction-items.entity';

@Entity({ name: 'transactions'})
export class Transactions extends CustomBaseEntity {

    @ManyToOne(
        () => Patient,
        patient => patient.transactions,
        { nullable: true },
    )
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

    @ManyToOne(
        () => StaffDetails,
        staff => staff.transactions,
        { nullable: true },
    )
    @JoinColumn({name: 'staff_id'})
    staff: StaffDetails;

    @ManyToOne(type => Service, {nullable: true})
    @JoinColumn({ name: 'service_id'})
    serviceType: Service;

    @ManyToOne(type => Department, {nullable: true})
    @JoinColumn({ name: 'department_id'})
    department: Department;

    @ManyToOne(type => Voucher, {nullable: true})
    @JoinColumn({ name: 'voucher_id'})
    voucher: Voucher;

    @Column({type: 'float4', nullable: true})
    amount: number;

    @Column({type: 'float4', nullable: true})
    voucher_amount: number;

    @Column({type: 'float4', nullable: true})
    amount_paid: number;

    @Column({type: 'float4', nullable: true})
    balance: number;

    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    payment_type: string;

    @Column({nullable: true})
    transaction_type: string;

    @Column({type: 'smallint', default: 0})
    status: number;

    @Column({type: 'smallint', default: 0})
    hmo_approval_status: number;

    @OneToMany(
        () => TransactionItems,
        items => items.transaction,
    )
    items: TransactionItems[];
}
