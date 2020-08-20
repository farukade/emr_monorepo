import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { Like, Connection } from 'typeorm';
import { ServiceRepository } from '../settings/services/service.repository';
import { PatientVitalRepository } from './repositories/patient_vitals.repository';
import { PatientAntenatalRepository } from './repositories/patient_antenatal.repository';
import { PatientAllergyRepository } from './repositories/patient_allergy.repository';
import { PatientAntenatalDto } from './dto/patient.antenatal.dto';
import { PatientAllergyDto } from './dto/patient.allergy.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { PatientAntenatal } from './entities/patient_antenatal.entity';
import { PatientAllergy } from './entities/patient_allergies.entity';
import { PatientRequestHelper } from '../../common/utils/PatientRequestHelper';
import { PatientRequestRepository } from './repositories/patient_request.repository';
import { PatientRequest } from './entities/patient_requests.entity';
import * as moment from 'moment';
import { HmoRepository } from '../hmo/hmo.repository';
import { VoucherRepository } from '../finance/vouchers/voucher.repository';
import { Voucher } from '../finance/vouchers/voucher.entity';
import { PatientDocument } from './entities/patient_documents.entity';
import { PatientRequestDocument } from './entities/patient_request_documents.entity';
import { PatientDocumentRepository } from './repositories/patient_document.repository';
import { User } from '../hr/entities/user.entity';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { RequestPaymentHelper } from '../../common/utils/RequestPaymentHelper';
import { ImmunizationDto } from './dto/immunization.dto';
import { ImmunizationRepository } from './repositories/immunization.repository';
import { Immunization } from './entities/immunization.entity';
import {OpdPatientDto} from "./dto/opd-patient.dto";
import {AppGateway} from "../../app.gateway";
import {AppointmentRepository} from "../frontdesk/appointment/appointment.repository";

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNOKRepository)
        private patientNOKRepository: PatientNOKRepository,
        @InjectRepository(PatientVitalRepository)
        private patientVitalRepository: PatientVitalRepository,
        @InjectRepository(PatientAntenatalRepository)
        private patientAntenatalRepository: PatientAntenatalRepository,
        @InjectRepository(PatientAllergyRepository)
        private patientAllergyRepository: PatientAllergyRepository,
        @InjectRepository(PatientRequestRepository)
        private patientRequestRepository: PatientRequestRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
        @InjectRepository(VoucherRepository)
        private voucherRepository: VoucherRepository,
        @InjectRepository(PatientDocumentRepository)
        private patientDocumentRepository: PatientDocumentRepository,
        @InjectRepository(ImmunizationRepository)
        private immunizationRepository: ImmunizationRepository,
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        private connection: Connection,
        private readonly appGateway: AppGateway,
    ) {}

    async listAllPatients(): Promise<Patient[]> {
        return await this.patientRepository.find();
    }

    async findPatient(param: string): Promise<Patient[]> {
        return await this.patientRepository.find({where: [
            {surname: Like(`%${param.toLocaleLowerCase()}%`)},
            {other_names: Like(`%${param.toLocaleLowerCase()}%`)},
            {fileNumber: Like(`%${param}%`)},
        ], relations: ['nextOfKin']});
    }

    async saveNewPatient(patientDto: PatientDto, createdBy: string): Promise<any> {
        try {
            const {hmoId} = patientDto;
            let hmo;
            if (hmoId && hmoId !== '') {
                hmo = await this.hmoRepository.findOne(hmoId);
            }
            const nok = await this.patientNOKRepository.saveNOK(patientDto);

            const patient = await this.patientRepository.savePatient(patientDto, nok, hmo, createdBy);

            return {success: true, patient};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async saveNewOpdPatient(patientDto: OpdPatientDto, createdBy: string): Promise<any> {
        try {
            const patient = new Patient();
            patient.fileNumber          =  'DEDA-' + Math.floor(Math.random() * 90000);
            patient.surname             = patientDto.surname.toLocaleLowerCase();
            patient.other_names         = patientDto.other_names.toLocaleLowerCase();
            patient.address             = patientDto.address.toLocaleLowerCase();
            patient.date_of_birth       = patientDto.date_of_birth;
            patient.gender              = patientDto.gender;
            patient.email               = patientDto.email;
            patient.phoneNumber         = patientDto.phoneNumber;
            patient.createdBy           = createdBy;
            await patient.save();
            // save appointment
            const appointment = await this.appointmentRepository.saveOPDAppointment(patient, patientDto.opdType);
            // send new opd socket message
            this.appGateway.server.emit('new-opd-queue', appointment);

            return {success: true, patient};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async updatePatientRecord(id: string, patientDto: PatientDto, updatedBy: string): Promise<any> {
        try {
            const patient = await this.patientRepository.findOne(id, {relations: ['nextOfKin']});
            patient.surname             = patientDto.surname.toLocaleLowerCase();
            patient.other_names         = patientDto.other_names.toLocaleLowerCase();
            patient.address             = patientDto.address.toLocaleLowerCase();
            patient.date_of_birth       = patientDto.date_of_birth;
            patient.occupation          = patientDto.occupation;
            patient.gender              = patientDto.gender;
            patient.email               = patientDto.email;
            patient.phoneNumber         = patientDto.phoneNumber;
            patient.maritalStatus       = patientDto.maritalStatus;
            patient.ethnicity           = patientDto.ethnicity;
            patient.referredBy          = patientDto.referredBy;
            patient.insurranceStatus    = patientDto.insurranceStatus;
            patient.lastChangedBy       = updatedBy;
            patient.nextOfKin.surname   = patientDto.nok_surname;
            patient.nextOfKin.other_names         = patientDto.nok_other_names;
            patient.nextOfKin.address             = patientDto.nok_address;
            patient.nextOfKin.date_of_birth       = patientDto.nok_date_of_birth;
            patient.nextOfKin.relationship        = patientDto.relationship;
            patient.nextOfKin.occupation          = patientDto.nok_occupation;
            patient.nextOfKin.gender              = patientDto.nok_gender;
            patient.nextOfKin.email               = patientDto.nok_email;
            patient.nextOfKin.phoneNumber         = patientDto.nok_phoneNumber;
            patient.nextOfKin.maritalStatus       = patientDto.nok_maritalStatus;
            patient.nextOfKin.ethnicity           = patientDto.nok_ethnicity;
            if (patientDto.hmoId && patientDto.hmoId !== '') {
                patient.hmo = await this.hmoRepository.findOne(patientDto.hmoId);;
            }
            patient.save();

            return {success: true, patient};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async deletePatient(id: string) {
        const result = await this.patientRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient with ID '${id}' not found`);
        }
    }

    async checkPaymentStatus(param) {
        const  {service_id, patient_id} = param;
        // find patient record
        const patient = this.patientRepository.findOne(patient_id);
    }

    async doSaveVitals(param, createdBy: string): Promise<any> {
        const { patient_id, readingType, reading } = param;
        try {
            const patient = await this.patientRepository.findOne(patient_id);
            if (patient) {
                const data = {
                    readingType,
                    reading,
                    patient,
                    createdBy,
                };
                const readings = await this.patientVitalRepository.save(data);
                return {success: true, readings };
            } else {
                return {success: false, message: 'Patient record was not found'};
            }
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async doUpdateVital(vitalId, param, updatedBy): Promise<any> {
        try {
            const vital = await this.patientVitalRepository.findOne(vitalId);
            vital.reading = param.reading;
            vital.readingType = param.readingType;
            vital.lastChangedBy = updatedBy;
            await vital.save();

            return {success: true, vital };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async getVouchers(id, urlParams): Promise<Voucher[]> {
        const {startDate, endDate, status} = urlParams;

        const query = this.voucherRepository.createQueryBuilder('v')
                        .where('v.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (status && status !== '') {
            let stat;
            if (status === 'active') {
                stat = true;
            } else {
                stat = false;
            }
            query.andWhere('q.isActive = :status', {status: stat});
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async getDocuments(id, urlParams): Promise<PatientDocument[]> {
        const {startDate, endDate, documentType} = urlParams;

        const query = this.patientDocumentRepository.createQueryBuilder('v')
                        .select(['v.document_name', 'v.document_type'])
                        .where('v.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (documentType && documentType !== '') {
            query.andWhere('q.document_type = :document_type', {document_type: documentType});
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async getRequestDocuments(id, urlParams): Promise<PatientRequestDocument[]> {
        const {startDate, endDate, documentType} = urlParams;

        return await this.connection.getRepository(PatientRequestDocument).createQueryBuilder('d')
                        .select(['document_name'])
                        .where('d.id = :id', {id})
                        .getMany();

    }

    async getVitals(id, urlParams): Promise<PatientVital[]> {
        const {startDate, endDate} = urlParams;

        const query = this.patientVitalRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .where('q.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async deleteVital(id: string) {
        const result = await this.patientVitalRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient vital with ID '${id}' not found`);
        }
        return {success: true};
    }

    async doSaveAllergies(param: PatientAllergyDto, createdBy): Promise<any> {
        const { patient_id } = param;
        try {
            param.patient = await this.patientRepository.findOne(patient_id);
            const allergy = await this.patientAllergyRepository.save(param);
            allergy.createdBy = createdBy;
            allergy.save();
            return {success: true, allergy };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async doUpdateAllergy(allergyId, param: PatientAllergyDto, updatedBy): Promise<any> {
        try {
            const allergy = await this.patientAllergyRepository.findOne(allergyId);
            allergy.category = param.category;
            allergy.allergy = param.allergy;
            allergy.severity = param.severity;
            allergy.reaction = param.reaction;
            allergy.lastChangedBy = updatedBy;
            await allergy.save();

            return {success: true, allergy };

        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async getAllergies(id, urlParams): Promise<PatientAllergy[]> {
        const {startDate, endDate} = urlParams;

        const query = this.patientAllergyRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .where('q.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async deleteAllergy(id: string) {
        const result = await this.patientAllergyRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient allergy with ID '${id}' not found`);
        }
        return {success: true};
    }

    async saveNewImmunization(param: ImmunizationDto, createdBy): Promise<any> {
        const { patient_id } = param;
        try {
            param.patient = await this.patientRepository.findOne(patient_id);
            param.createdBy = createdBy;
            param.lastChangedBy = createdBy;
            const immunization = await this.immunizationRepository.save(param);
            return {success: true, immunization };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async doUpdateImmunization(immunization_id, param: ImmunizationDto, updatedBy): Promise<any> {
        try {
            const immunization = await this.immunizationRepository.findOne(immunization_id);
            immunization.typeOfVaccine = param.typeOfVaccine;
            immunization.dateOfAdministration = param.dateOfAdministration;
            immunization.vaccineBatchNo = param.vaccineBatchNo;
            immunization.prescription = param.prescription;
            immunization.nextVisitDate = param.nextVisitDate;
            immunization.lastChangedBy = updatedBy;
            await immunization.save();

            return {success: true, immunization };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async getPatientImmunizations(id, urlParams): Promise<Immunization[]> {
        const {startDate, endDate} = urlParams;

        const query = this.immunizationRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .leftJoin(User, 'creator', 'q.createdBy = creator.username')
                        .innerJoin(StaffDetails, 'staff', 'staff.user_id = creator.id')
                        .leftJoin(StaffDetails, 'administer', 'q.administeredBy = administer.id')
                        .select('q.*')
                        .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.fileNumber')
                        .addSelect('CONCAT(staff.first_name || \' \' || staff.last_name) as created_by, staff.id as created_by_id')
                        .addSelect('CONCAT(administer.first_name || \' \' || administer.last_name) as administeredByName')
                        .where('q.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        return await query.orderBy('q.createdAt', 'DESC').getRawMany();
    }

    async getImmunizations(urlParams): Promise<Immunization[]> {
        const {startDate, patient_id, endDate} = urlParams;

        const query = this.immunizationRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .leftJoin(StaffDetails, 'administer', 'q.administeredBy = administer.id')
                        .leftJoin(User, 'creator', 'q.createdBy = creator.username')
                        .innerJoin(StaffDetails, 'staff', 'staff.user_id = creator.id')
                        .select('q.*')
                        .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.fileNumber')
                        .addSelect('CONCAT(staff.first_name || \' \' || staff.last_name) as created_by, staff.id as created_by_id')
                        .addSelect('CONCAT(administer.first_name || \' \' || administer.last_name) as administeredByName');

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', {patient_id});
        }
        return await query.orderBy('q.createdAt', 'DESC').getRawMany();
    }

    async deleteImmunization(id: string) {
        const result = await this.immunizationRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient immunization with ID '${id}' not found`);
        }
        return {success: true};
    }

    async doSaveRequest(param, createdBy) {
        const { requestType, patient_id } = param;
        if (!requestType && requestType === '' ) {
            return {success: false, message: 'Request Type cannot be empty'};
        }
        let res = {};
        const patient = await this.patientRepository.findOne(patient_id, {relations: ['hmo']});
        switch (requestType) {
            case 'lab':
                // save request
                let labRequest = await PatientRequestHelper.handleLabRequest(param, patient, createdBy);
                if (labRequest.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.clinicalLabPayment(param.requestBody, patient, createdBy);
                    labRequest = {...labRequest, ...payment};
                }
                res = labRequest;
                break;
            case 'pharmacy':
                let pharmacyReq = await PatientRequestHelper.handlePharmacyRequest(param, patient, createdBy);
                if (pharmacyReq.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.pharmacyPayment(param.requestBody, patient, createdBy);
                    pharmacyReq = {...pharmacyReq, ...payment};
                }
                res = pharmacyReq;
                break;
            case 'physiotherapy':
                let physio = await PatientRequestHelper.handlePhysiotherapyRequest(param, patient, createdBy);
                if (physio.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.physiotherapyPayment(param.requestBody, patient, createdBy);
                    physio = {...physio, ...payment};
                }
                res = physio;
                break;
            case 'opthalmology':
                let req = await PatientRequestHelper.handleOpthalmolgyRequest(param, patient, createdBy);
                if (req.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.opthalmologyPayment(param.requestBody, patient, createdBy);
                    req = {...req, ...payment};
                }
                res = req;
                break;
            case 'dentistry':
                let dentistry = await PatientRequestHelper.handleDentistryRequest(param, patient, createdBy);
                if (dentistry.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.dentistryPayment(param.requestBody, patient, createdBy);
                    dentistry = {...dentistry, ...payment};
                }
                res = dentistry;
                break;
            case 'imaging':
                let imaging = await PatientRequestHelper.handleImagingRequest(param, patient, createdBy);
                if (imaging.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.imagingPayment(param.requestBody, patient, createdBy);
                    imaging = {...imaging, ...payment};
                }
                res = imaging;
                break;
            case 'procedure':
                let procedure = await PatientRequestHelper.handleProcedureRequest(param, patient, createdBy);
                if (procedure.success && param.requestBody.bill_now === true) {
                    // save transaction
                    const payment = await RequestPaymentHelper.procedurePayment(param.requestBody, patient, createdBy);
                    procedure = {...procedure, ...payment};
                }
                res = procedure;
                break;
            default:
                res = {success: false, message: 'No data'};
                break;
        }
        return res;
    }

    async doFillRequest(param, updatedBy) {
        const {request_id, requestBody } = param;
        try {
            const request = await this.patientRequestRepository.findOne(request_id);
            request.requestBody = requestBody;
            request.isFilled = true;
            await request.save();
            return {success: true};
        } catch (e) {
            // console.log(e.message)
            return {success: false, message: e.message };
        }
    }

    async doListRequest(requestType, patient_id, urlParams): Promise<PatientRequest[]> {
        const {startDate, endDate, filled} = urlParams;

        const query = this.patientRequestRepository.createQueryBuilder('q')
                        .leftJoin('q.patient', 'patient')
                        .leftJoin(User, 'creator', 'q.createdBy = creator.username')
                        .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
                        .select('q.id, q.requestType, q.requestBody, q.createdAt')
                        .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
                        .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.fileNumber')
                        .where('q.patient_id = :patient_id', {patient_id})
                        .andWhere('q.requestType = :requestType', {requestType});

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (filled) {
            query.andWhere(`q.isFilled = ${true}`);
        }
        return await query.orderBy('q.createdAt', 'DESC').getRawMany();
    }

    async listRequests(requestType, urlParams): Promise<PatientRequest[]> {
        const {startDate, endDate, filled} = urlParams;
        console.log(urlParams);
        const query = this.patientRequestRepository.createQueryBuilder('patient_request')
                        .leftJoin('patient_request.patient', 'patient')
                        .leftJoin(User, 'creator', 'patient_request.createdBy = creator.username')
                        .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
                        .select('patient_request.id, patient_request.requestType, patient_request.requestBody, patient_request.createdAt')
                        .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
                        .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.fileNumber')
                        .andWhere('patient_request.requestType = :requestType', {requestType});

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`patient_request.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`patient_request.createdAt <= '${end}'`);
        }

        if (filled) {
            console.log(filled)
            query.andWhere('patient_request.isFilled = :filled', {filled: true});
        }

        return await query.orderBy('patient_request.createdAt', 'DESC').getRawMany();

    }

    async deleteRequest(id: string) {
        const result = await this.patientRequestRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient request with ID '${id}' not found`);
        }
        return {success: true};
    }

    async doUploadDocument(id, param, fileName, createdBy) {

        const patient = await this.patientRepository.findOne(id);
        try {
            const doc = new PatientDocument();
            doc.patient = patient;
            doc.document_type = param.document_type;
            doc.document_name = fileName;
            doc.createdBy = createdBy;
            await doc.save();

            return {success: true };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async doUploadRequestDocument(id, param, files, createdBy) {
        const request = await this.patientRequestRepository.findOne(id);
        for (const file of files) {
            try {
                const doc = new PatientRequestDocument();
                doc.request = request;
                doc.document_type = param.document_type;
                doc.document_name = file.filename;
                doc.createdBy = createdBy;
                await doc.save();
            } catch (error) {
                return {success: false, message: error.message };
            }
        }
        return {success: true };
    }
}
