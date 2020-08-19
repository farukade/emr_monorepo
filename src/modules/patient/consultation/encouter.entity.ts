import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { IDiagnosisInterface } from './interfaces/diagnosis.interface';
import { IAllergyInterface } from './interfaces/allergy.interface';
import { Patient } from '../entities/patient.entity';
import { PatientRequest } from '../entities/patient_requests.entity';
import {Appointment} from '../../frontdesk/appointment/appointment.entity';

@Entity({name: 'encounters'})
export class Encounter extends CustomBaseEntity {
    @Column({type: 'text'})
    complaints: string;
    @Column('simple-array', {nullable: true})
    reviewOfSystem: string[];
    @Column('simple-json', {nullable: true})
    patientHistory: string[];
    @Column('simple-json', {nullable: true})
    medicalHistory: string[];
    @Column('simple-json', {nullable: true})
    allergies: IAllergyInterface[];
    @Column('json', {nullable: true})
    physicalExamination: string[];
    @Column({nullable: true})
    physicalExaminationSummary: string;
    @Column('simple-json', {nullable: true})
    diagnosis: IDiagnosisInterface[];
    @Column('simple-json', {nullable: true})
    plan: any;
    @Column('simple-json', {nullable: true})
    nextAppointment: object;
    @Column('simple-json', {nullable: true})
    consumable: string;
    @Column('text', {nullable: true})
    note: string;
    @Column('text', {nullable: true})
    instructions: string;
    @OneToOne(type => Appointment)
    appointment: Appointment;
    @ManyToOne(type => Patient)
    patient: Patient;
    @OneToOne(() => PatientRequest)
    procedure?: PatientRequest;
    @OneToOne(() => PatientRequest)
    labRequest?: PatientRequest;
    @OneToOne(() => PatientRequest)
    imagingRequest?: PatientRequest;
    @OneToOne(() => PatientRequest)
    pharmacyRequest?: PatientRequest;
}
