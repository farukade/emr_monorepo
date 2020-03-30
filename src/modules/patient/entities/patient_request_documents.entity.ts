import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { PatientRequest } from './patient_requests.entity';

@Entity({name: 'patient_request_documents'})
export class PatientRequestDocument extends CustomBaseEntity {

    @Column()
    document_type: string;

    @Column()
    document_name: string;

    @ManyToOne(type => PatientRequest)
    request: PatientRequest;
}
