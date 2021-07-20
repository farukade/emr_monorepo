import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTest } from '../../settings/entities/lab_test.entity';
import { PatientRequest } from './patient_requests.entity';
import { PatientDocument } from './patient_documents.entity';
import { PatientDiagnosis } from './patient_diagnosis.entity';
import { Immunization } from '../immunization/entities/immunization.entity';
import { Transactions } from '../../finance/transactions/transaction.entity';
import { Drug } from '../../inventory/entities/drug.entity';
import { DrugBatch } from '../../inventory/entities/batches.entity';
import { DrugGeneric } from '../../inventory/entities/drug_generic.entity';
import { ServiceCost } from '../../settings/entities/service_cost.entity';

@Entity({ name: 'patient_request_items' })
export class PatientRequestItem extends CustomBaseEntity {
    @OneToOne(type => PatientRequest, request => request.item)
    @JoinColumn({ name: 'request_id' })
    request: PatientRequest;

    @ManyToOne(type => LabTest, { nullable: true, eager: true })
    @JoinColumn({ name: 'lab_test_id' })
    labTest: LabTest;

    @ManyToOne(type => Drug, { nullable: true, eager: true })
    @JoinColumn({ name: 'drug_id' })
    drug: Drug;

    @ManyToOne(type => DrugBatch, { nullable: true, eager: true })
    @JoinColumn({ name: 'drug_batch_id' })
    drugBatch: DrugBatch;

    @ManyToOne(type => DrugGeneric, { nullable: true, eager: true })
    @JoinColumn({ name: 'drug_generic_id' })
    drugGeneric: DrugGeneric;

    @ManyToOne(type => ServiceCost, { nullable: true, eager: true })
    @JoinColumn({ name: 'service_cost_id' })
    service: ServiceCost;

    @Column({ type: 'smallint', default: 0 })
    filled: number;

    @Column({ type: 'smallint', default: 0, name: 'fill_quantity' })
    fillQuantity: number;

    @Column({ type: 'varchar', nullable: true, name: 'filled_by' })
    filledBy: string;

    @Column({ nullable: true, name: 'filled_at' })
    filledAt: string;

    @Column({ type: 'smallint', default: 0 })
    cancelled: number;

    @Column({ type: 'varchar', nullable: true, name: 'cancelled_by' })
    cancelledBy: string;

    @Column({ type: 'varchar', nullable: true, name: 'cancel_note' })
    cancelNote: string;

    @Column({ nullable: true, name: 'cancelled_at' })
    cancelledAt: string;

    @Column({ type: 'smallint', default: 0 })
    substituted: number;

    @Column({ nullable: true, name: 'substituted_at' })
    substitutedAt: string;

    @Column({ type: 'varchar', nullable: true, name: 'substituted_by' })
    substitutedBy: string;

    @Column({ type: 'varchar', nullable: true, name: 'substitution_reason' })
    substitutionReason: string;

    @Column({ type: 'smallint', default: 0 })
    received: number;

    @Column({ type: 'varchar', nullable: true, name: 'received_by' })
    receivedBy: string;

    @Column({ nullable: true, name: 'received_at' })
    receivedAt: string;

    @Column({ type: 'smallint', default: 0 })
    approved: number;

    @Column({ type: 'varchar', nullable: true, name: 'approved_by' })
    approvedBy: string;

    @Column({ nullable: true, name: 'approved_at' })
    approvedAt: string;

    @Column({ type: 'jsonb', nullable: true })
    parameters: any;

    @Column({ nullable: true })
    result: string;

    @Column({ nullable: true })
    note: string;

    @Column({ nullable: true, name: 'dose_quantity' })
    doseQuantity: string;

    @Column({ default: false })
    refillable: boolean;

    @Column({ default: false, name: 'scheduled_date' })
    scheduledDate: boolean;

    @Column({ nullable: true, name: 'scheduled_start_date' })
    scheduledStartDate: string;

    @Column({ nullable: true, name: 'scheduled_end_date' })
    scheduledEndDate: string;

    @Column({ nullable: true, name: 'started_date' })
    startedDate: string;

    @Column({ nullable: true, name: 'finished_date' })
    finishedDate: string;

    @Column({ default: 0 })
    refills: number;

    @Column({ nullable: true })
    frequency: number;

    @Column({ nullable: true })
    frequencyType: string;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true, name: 'external_prescription' })
    externalPrescription: string;

    @ManyToOne(type => Immunization, { nullable: true, eager: true })
    @JoinColumn({ name: 'vaccine_id' })
    vaccine: Immunization;

    @OneToOne(type => PatientDocument, doc => doc.item, { nullable: true, eager: true })
    @JoinColumn({ name: 'document_id' })
    document: PatientDocument;

    @OneToMany(type => PatientDiagnosis, data => data.request, { eager: true })
    @JoinColumn({ name: 'patient_diagnosis_id' })
    diagnosis: PatientDiagnosis;

    @Column({ nullable: true })
    resources: string;

    @OneToOne(type => Transactions, data => data.patientRequestItem)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transactions;
}
