import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnrollmentRepository } from './enrollment.repository';
import { EnrollmentDto } from './dto/enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientAntenatal } from '../entities/patient_antenatal.entity';
import * as moment from 'moment';
import { Patient } from '../entities/patient.entity';
import { AntenatalVisitDto } from './dto/antenatal-visits.dto';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { AntenatalVisits } from './entities/antenatal-visits.entity';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { AntenatalVisitRepository } from './antenatal-visits.repository';

@Injectable()
export class AntenatalService {
    constructor(
        @InjectRepository(EnrollmentRepository)
        private enrollmentRepository: EnrollmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(AntenatalVisitRepository)
        private antenatalVisitRepository: AntenatalVisitRepository,
    ) {

    }

    async saveEnrollment(createDto: EnrollmentDto, createdBy) {
        // find patient
        const patient = await this.patientRepository.findOne(createDto.patient_id);
        try {
            createDto.patient = patient;
            createDto.createdBy = createdBy;
            const enrollment = await this.enrollmentRepository.save(createDto);
            return {success: true, enrollment};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async getAntenatals(options: PaginationOptionsInterface, urlParams): Promise<PatientAntenatal[]> {
        const {startDate, endDate} = urlParams;

        const query = this.enrollmentRepository.createQueryBuilder('e')
                            .innerJoinAndSelect('e.patient', 'patient')
                            .select('e.*')
                            .addSelect('patient.surname, patient.other_names');
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`e.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`e.createdAt <= '${end}'`);
        }

        return await query.take(options.limit).skip(options.page * options.limit).getRawMany();
    }

    async saveAntenatalVisits(antenatalVisitDto: AntenatalVisitDto, createdBy) {
        const { labRequest, imagingRequest, pharmacyRequest } = antenatalVisitDto;
        const patient = await this.patientRepository.findOne(antenatalVisitDto.patient_id);
        try {
            const visit = new AntenatalVisits();
            visit.heightOfFunds = antenatalVisitDto.heightOfFunds;
            visit.fetalHeartRate = antenatalVisitDto.fetalHeartRate;
            visit.fetalLie = antenatalVisitDto.fetalLie;
            visit.positionOfFetus = antenatalVisitDto.positionOfFetus;
            visit.relationshipToBrim = antenatalVisitDto.relationshipToBrim;
            visit.comment = antenatalVisitDto.comment;
            visit.patient = patient;
            // save request
            if (labRequest && labRequest.requestBody) {
                const labRequestRes = await PatientRequestHelper.handleLabRequest(labRequest, patient, createdBy);
                if (labRequestRes.success) {
                    // save transaction
                    await RequestPaymentHelper.clinicalLabPayment(labRequest.requestBody, patient, createdBy);
                    visit.labRequest = labRequestRes.data;
                }
            }

            if (pharmacyRequest && pharmacyRequest.requestBody) {
                const pharmacyReqRes = await PatientRequestHelper.handlePharmacyRequest(pharmacyRequest, patient, createdBy);
                if (pharmacyReqRes.success) {
                    // save transaction
                    await RequestPaymentHelper.pharmacyPayment(pharmacyRequest.requestBody, patient, createdBy);
                    visit.pharmacyRequest = pharmacyReqRes.data;
                }
            }

            if (imagingRequest && imagingRequest.requestBody) {
                const radiologyRes = await PatientRequestHelper.handleImagingRequest(imagingRequest, patient, createdBy);
                if (radiologyRes.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.imagingPayment(imagingRequest.requestBody, patient, createdBy);
                    visit.radiologyRequest = radiologyRes.data;
                }
            }
            
            return {success: true, visit};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    getPatientAntenatalVisits(options: PaginationOptionsInterface, {patient_id, startDate, endDate}) {
        const query = this.antenatalVisitRepository.createQueryBuilder('q');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patientId = :patient_id', {patient_id});
        }

        if (status) {
            query.andWhere('q.status = :status', {status});
        }
    }
}
