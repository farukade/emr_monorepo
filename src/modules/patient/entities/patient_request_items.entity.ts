import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTest } from '../../settings/entities/lab_test.entity';
import { Stock } from '../../inventory/entities/stock.entity';
import { PatientRequest } from './patient_requests.entity';
import { Service } from '../../settings/entities/service.entity';

@Entity({ name: 'patient_request_items' })
export class PatientRequestItem extends CustomBaseEntity {
    @ManyToOne(type => PatientRequest, request => request.items)
    @JoinColumn({ name: 'request_id' })
    request: PatientRequest;

    @ManyToOne(type => LabTest, { nullable: true, eager: true })
    @JoinColumn({ name: 'lab_test_id' })
    labTest: LabTest;

    @ManyToOne(type => Stock, { nullable: true, eager: true })
    @JoinColumn({ name: 'drug_id' })
    drugId: Stock;

    @ManyToOne(type => Service, { nullable: true, eager: true })
    @JoinColumn({ name: 'service_id' })
    serviceId: Service;

    @Column({ type: 'smallint', default: 0 })
    filled: number;

    @Column({ type: 'varchar', length: 300, nullable: true, name: 'filled_by' })
    filledBy: string;

    @Column({ nullable: true, name: 'filled_at' })
    filledAt: string;

    @Column({ type: 'smallint', default: 0 })
    cancelled: number;

    @Column({ type: 'varchar', length: 300, nullable: true, name: 'cancelled_by' })
    cancelledBy: string;

    @Column({ nullable: true, name: 'cancelled_at' })
    cancelledAt: string;

    @Column({ type: 'smallint', default: 0 })
    received: number;

    @Column({ type: 'varchar', length: 300, nullable: true, name: 'received_by' })
    receivedBy: string;

    @Column({ nullable: true, name: 'received_at' })
    receivedAt: string;

    @Column({ type: 'smallint', default: 0 })
    approved: number;

    @Column({ type: 'varchar', length: 300, nullable: true, name: 'approved_by' })
    approvedBy: string;

    @Column({ nullable: true, name: 'approved_at' })
    approvedAt: string;

    @Column({ type: 'jsonb', nullable: true })
    parameters: any;

    @Column({ nullable: true })
    result: string;

    @Column({ nullable: true })
    note: string;
}