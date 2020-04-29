import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { IDiagnosisInterface } from './interfaces/diagnosis.interface';
import { IAllergyInterface } from './interfaces/allergy.interface';
import { Patient } from '../entities/patient.entity';

@Entity({name: 'encounters'})
export class Encounter extends CustomBaseEntity {
    @Column({type: 'text'})
    complaints: string;
    @Column('simple-array', {nullable: true})
    reviewOfSystem: string[];
    @Column('simple-array', {nullable: true})
    patientHistory: string[];
    @Column('simple-array', {nullable: true})
    medicalHistory: string[];
    @Column('simple-array', {nullable: true})
    allergies: IAllergyInterface[];
    @Column('simple-array', {nullable: true})
    physicalExamination: string[];
    @Column('simple-array', {nullable: true})
    physicalExaminationSummary: string;
    @Column('simple-array', {nullable: true})
    diagnosis: IDiagnosisInterface[];
    @Column('simple-json', {nullable: true})
    investigations: {
        labRequest: {},
        imagingRequest: {},
    };
    @Column('simple-json', {nullable: true})
    plan: any;
    @Column('simple-json', {nullable: true})
    nextAppointment: {};
    @Column('simple-json', {nullable: true})
    procedure: {};
    @Column('simple-array', {nullable: true})
    consumable: string[];
    @Column('text', {nullable: true})
    note: string;
    @Column('text', {nullable: true})
    instructions: string;
    @ManyToOne(type => Patient)
    patient: Patient;
}
