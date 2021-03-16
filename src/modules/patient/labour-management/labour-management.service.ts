import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabourEnrollmentRepository } from './repositories/labour-enrollment.repository';
import { LabourMeasurementRepository } from './repositories/labour-measurement.repository';
import { LabourVitalRepository } from './repositories/labour-vital.repository';
import { LabourRiskAssessmentRepository } from './repositories/labour-risk-assessment.repository';
import { LabourDeliveryRecordRepository } from './repositories/labour-delivery-record.repository';
import { LabourEnrollmentDto } from './dto/labour-enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { Patient } from '../entities/patient.entity';
import * as moment from 'moment';
import { LabourMeasurementDto } from './dto/labour-measurement.dto';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { LabourVitalDto } from './dto/labour-vital.dto';
import { LabourRistAssesmentDto } from './dto/labour-risk-assessment.dto';
import { LabourDeliveryRecordDto } from './dto/labour-delivery.dto';
import { LabourMeasurement } from './entities/labour_measurement.entity';
import { LabourVital } from './entities/labour_vital.entity';
import { LabourRiskAssessment } from './entities/labour_risk_assessment.entity';
import { LabourDeliveryRecord } from './entities/labour_delivery_record.entity';
import { LabourEnrollment } from './entities/labour_enrollment.entity';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { LabTestRepository } from '../../settings/lab/lab.test.repository';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { AppGateway } from '../../../app.gateway';

@Injectable()
export class LabourManagementService {
    constructor(
        @InjectRepository(LabourEnrollmentRepository)
        private labourEnrollmentRepository: LabourEnrollmentRepository,
        @InjectRepository(LabourMeasurementRepository)
        private labourMeasurementRepo: LabourMeasurementRepository,
        @InjectRepository(LabourVitalRepository)
        private labourVitalRepo: LabourVitalRepository,
        @InjectRepository(LabourRiskAssessmentRepository)
        private labourRiskAssessmentRepo: LabourRiskAssessmentRepository,
        @InjectRepository(LabourDeliveryRecordRepository)
        private labourDeliveryRepo: LabourDeliveryRecordRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(LabTestRepository)
        private labTestRepository: LabTestRepository,
        private readonly appGateway: AppGateway,
    ) {
    }

    async listEnrollments(options: PaginationOptionsInterface, urlParams): Promise<any> {
        const { startDate, endDate, patient_id } = urlParams;
        console.log(patient_id);

        const query = this.labourEnrollmentRepository.createQueryBuilder('enrollment')
            .innerJoinAndSelect('enrollment.patient', 'patient')
            .select('enrollment.*')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.fileNumber, patient.date_of_birth');

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`enrollment.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`enrollment.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('enrollment.patient_id = :patient_id', { patient_id });
        }

        const requests = await query.offset(options.page * options.limit)
            .limit(options.limit)
            .orderBy('enrollment.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        return {
            result: requests,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page + 1,
        };
    }

    async getEnrollment(id: number): Promise<LabourEnrollment> {
        const enrollment = this.labourEnrollmentRepository.createQueryBuilder('enrollment')
            .innerJoinAndSelect('enrollment.patient', 'patient')
            .select('enrollment.*')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.fileNumber, patient.hmo_id, patient.date_of_birth')
            .where('enrollment.id = :id', { id })
            .getRawOne();

        return enrollment;
    }

    async doSaveEnrollment(id: number, dto: LabourEnrollmentDto, createdBy): Promise<any> {
        try {
            dto.createdBy = createdBy;
            dto.lastChangedBy = createdBy;
            dto.patient = await this.patientRepository.findOne(id);
            const enrollment = await this.labourEnrollmentRepository.save(dto);
            return { success: true, data: enrollment };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async doSaveMeasurement(id: number, dto: LabourMeasurementDto, createdBy): Promise<any> {
        try {
            const { labTests, examiner_id } = dto;

            const enrollment = await this.labourEnrollmentRepository.findOne(id);

            const measure = new LabourMeasurement();
            measure.lastChangedBy = createdBy;
            measure.enrollment = enrollment;
            measure.examiner = await this.staffRepository.findOne(examiner_id);

            const measurement = await this.labourMeasurementRepo.save(measure);

            // TODO: request for lab tests

            // let mappedIds = [];
            //
            // if (labTests.length > 0) {
            //     mappedIds = labTests.map(id => {
            //         id;
            //     });
            //     let labRequest = await PatientRequestHelper.handleLabRequest({
            //         requestBody: mappedIds,
            //         request_note: 'IVF enrollment lab tests',
            //     }, enrollment.patient, createdBy);
            //     if (labRequest.success) {
            //         // save transaction
            //         const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, enrollment.patient, createdBy);
            //         // @ts-ignore
            //         labRequest = { ...payment.labRequest };
            //
            //         this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
            //     }
            // }

            return { success: true, data: measurement };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async doSaveVital(id: string, dto: LabourVitalDto, createdBy): Promise<any> {
        try {
            dto.createdBy = createdBy;
            dto.lastChangedBy = createdBy;
            dto.enrollment = await this.labourEnrollmentRepository.findOne(id);
            const vitals = await this.labourVitalRepo.save(dto);
            return { success: true, data: vitals };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async doSaveRiskAssessment(id: string, dto: LabourRistAssesmentDto, createdBy): Promise<any> {
        try {
            dto.createdBy = createdBy;
            dto.lastChangedBy = createdBy;
            dto.enrollment = await this.labourEnrollmentRepository.findOne(id);
            const assessment = await this.labourRiskAssessmentRepo.save(dto);
            return { success: true, data: assessment };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async doSaveDeliveryRecord(id: string, dto: LabourDeliveryRecordDto, createdBy): Promise<any> {
        try {
            dto.createdBy = createdBy;
            dto.lastChangedBy = createdBy;
            dto.pediatrician = await this.staffRepository.findOne(dto.pediatrician_id);
            dto.enrollment = await this.labourEnrollmentRepository.findOne(id);
            const assessment = await this.labourDeliveryRepo.save(dto);
            return { success: true, data: assessment };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async fetchMeasurement(id: number): Promise<LabourMeasurement[]> {
        const enrollment = await this.labourEnrollmentRepository.findOne(id);
        const results = await this.labourMeasurementRepo.find({ where: { enrollment } });

        for (const result of results) {
            // find service record
            // const enrollment_lab_tests = [];
            // TODO: pick labs from request
            // if (result.labTests !== null) {
            //     const iterators = String(result.labTests).split(',');
            //     for (const labTestId of iterators) {
            //         // find service record
            //         const sertest = await this.labTestRepository.findOne(labTestId);
            //         enrollment_lab_tests.push(sertest);
            //     }
            // }
            //
            // result.labTests = enrollment_lab_tests;
        }
        return results;
    }

    async fetchVital(id: string): Promise<LabourVital[]> {
        const enrollment = await this.labourEnrollmentRepository.findOne(id);
        const results = await this.labourVitalRepo.find({ where: { enrollment } });
        return results;
    }

    async fetchRiskAssessment(id: string): Promise<LabourRiskAssessment[]> {
        const enrollment = await this.labourEnrollmentRepository.findOne(id);
        const results = await this.labourRiskAssessmentRepo.find({ where: { enrollment } });
        return results;
    }

    async fetchDeliveryRecord(id: string): Promise<LabourDeliveryRecord[]> {
        const enrollment = await this.labourEnrollmentRepository.findOne(id);
        const results = await this.labourDeliveryRepo.find({ where: { enrollment } });
        return results;
    }
}
