import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';

@Entity({ name: 'vouchers' })
export class Voucher extends CustomBaseEntity {

    @Column({ type: 'varchar', length: 300 })
    voucher_no: string;

    @Column({ type: 'float4' })
    amount: number;

    @Column({ type: 'float4', nullable: true })
    amount_used: number;

    @Column()
    duration: string;

    @Column()
    start_date: string;

    @ManyToOne(() => Patient, { nullable: true })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
