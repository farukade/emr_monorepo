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

@Injectable()
export class AntenatalService {
    constructor(
        @InjectRepository(EnrollmentRepository)
        private enrollmentRepository: EnrollmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
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

    async getAntenatals(urlParams): Promise<PatientAntenatal[]> {
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

        return await query.getRawMany();
    }

    async saveAntenatalVisits(antenatalVisitDto: AntenatalVisitDto, createdBy) {
        const { labRequest, radiologyRequest, pharmacyRequest } = antenatalVisitDto;
        const patient = await this.patientRepository.findOne(antenatalVisitDto.patient_id);
        try {
            const visit = new AntenatalVisits();
            visit.heightOfFunds = antenatalVisitDto.heightOfFunds;
            visit.fetalHeartRate = antenatalVisitDto.fetalHeartRate;
            visit.fetalLie = antenatalVisitDto.fetalLie;
            visit.positionOfFetus = antenatalVisitDto.positionOfFetus;
            visit.relationshipToBrim = antenatalVisitDto.relationshipToBrim;
            visit.comment = antenatalVisitDto.comment;
            // save request
            if (labRequest.requestBody) {
                const labRequestRes = await PatientRequestHelper.handleLabRequest(labRequest, patient, createdBy);
                if (labRequestRes.success) {
                    // save transaction
                    await RequestPaymentHelper.clinicalLabPayment(labRequest.requestBody, patient, createdBy);
                    visit.labRequest = labRequestRes.data;
                }
            }

            if (pharmacyRequest.requestBody) {
                const pharmacyReqRes = await PatientRequestHelper.handlePharmacyRequest(pharmacyRequest, patient, createdBy);
                if (pharmacyReqRes.success) {
                    // save transaction
                    await RequestPaymentHelper.pharmacyPayment(pharmacyRequest.requestBody, patient, createdBy);
                    visit.pharmacyRequest = pharmacyReqRes.data;
                }
            }

            if (radiologyRequest.requestBody) {
                const radiologyRes = await PatientRequestHelper.handleImagingRequest(radiologyRequest, patient, createdBy);
                if (radiologyRes.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.imagingPayment(radiologyRequest.requestBody, patient, createdBy);
                    visit.radiologyRequest = radiologyRes.data;
                }
            }
            return {success: true, visit};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }
}
