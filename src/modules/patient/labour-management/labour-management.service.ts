import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabourEnrollmentRepository } from './repositories/labour-enrollment.repository';
import { LabourMeasurementRepository } from './repositories/labour-measurement.repository';
import { LabourVitalRepository } from './repositories/labour-vital.repository';
import { LabourRiskAssessmentRepository } from './repositories/labour-risk-assessment.repository';
import { LabourDeliveryRecordRepository } from './repositories/labour-delivery-record.repository';
import { LabourEnrollmentDto } from './dto/labour-enrollement.dto';
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
    ) {
    }

    async listEnrollements(urlParams): Promise<any> {
        const { startDate, endDate, page } = urlParams;
        const limit = 20;
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
        const requests = query.skip((page * limit) - limit)
            .limit(limit)
            .orderBy('enrollment.createdAt', 'DESC')
            .getRawMany();

        return requests;
    }

    async doSaveEnrollement(id: string, dto: LabourEnrollmentDto, createdBy): Promise<any> {
        try {
            dto.createdBy = createdBy;
            dto.lastChangedBy = createdBy;
            dto.patient = await this.patientRepository.findOne(id);
            const enrollement = await this.labourEnrollmentRepository.save(dto);
            return { success: true, data: enrollement };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async doSaveMeasurement(id: string, dto: LabourMeasurementDto, createdBy): Promise<any> {
        try {
            dto.createdBy = createdBy;
            dto.lastChangedBy = createdBy;
            dto.enrollment = await this.labourEnrollmentRepository.findOne(id);
            dto.examiner = await this.staffRepository.findOne(dto.examiner_id);
            const measurement = await this.labourMeasurementRepo.save(dto);
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
