import { Injectable, NotFoundException, Delete } from '@nestjs/common';
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
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { Pagination } from '../../../common/paginate/paginate.interface';


@Injectable()
export class AntenatalService {
    constructor(
        @InjectRepository(EnrollmentRepository)
        private enrollmentRepository: EnrollmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(AntenatalVisitRepository)
        private antenatalVisitRepository: AntenatalVisitRepository,
        @InjectRepository(PatientRequestRepository)
        private patientRequestRepository: PatientRequestRepository,
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

    async getAntenatals(options: PaginationOptionsInterface, urlParams): Promise<Pagination> {
        const {startDate, endDate, patient_id } = urlParams;

        const query = this.enrollmentRepository.createQueryBuilder('q')
                            .select('q.*');
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patientId = :patient_id', { patient_id });
        }

        const antennatals = await query.offset(options.page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        for (const antennatal of antennatals) {

            if (antennatal.patient_id) {
                antennatal.patient = await this.patientRepository.findOne(antennatal.patient_id);
            }
        }

        return {
            result: antennatals,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page + 1,
        };

      
    }

    async deleteAntenatal(id: string) {
        // delete Antenatal rates
        await this.patientRequestRepository
            .createQueryBuilder()
            .delete()
            .where('Antenatal_id = :id', { id })
            .execute();
        // delete Antenatal
        const result = await this.patientRequestRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Antenatal with ID '${id}' not found`);
        }
        const antenatal = new PatientAntenatal();
        antenatal.id = Number(id);
        return antenatal;
    }

    async saveAntenatalVisits(antenatalVisitDto: AntenatalVisitDto, createdBy) {
        // const { labRequest, imagingRequest, pharmacyRequest } = antenatalVisitDto;
        // const patient = await this.patientRepository.findOne(antenatalVisitDto.patient_id);
        // try {
        //     const visit = new AntenatalVisits();
        //     visit.heightOfFunds = antenatalVisitDto.heightOfFunds;
        //     visit.fetalHeartRate = antenatalVisitDto.fetalHeartRate;
        //     visit.fetalLie = antenatalVisitDto.fetalLie;
        //     visit.positionOfFetus = antenatalVisitDto.positionOfFetus;
        //     visit.relationshipToBrim = antenatalVisitDto.relationshipToBrim;
        //     visit.comment = antenatalVisitDto.comment;
        //     visit.patient = patient;
        //     visit.createdBy = createdBy;
        //     visit.lastChangedBy = createdBy;
        //     visit.nextAppointment = antenatalVisitDto.nextAppointment;
        //     // save request
        //     if (labRequest && labRequest.requests) {
        //         const labRequestRes = await PatientRequestHelper.handleLabRequest(labRequest, patient, createdBy);
        //         if (labRequestRes.success) {
        //             // save transaction
        //             await RequestPaymentHelper.clinicalLabPayment(labRequestRes.data, patient, createdBy);
        //         }
        //
        //         visit.labRequests = labRequestRes.data;
        //     }
        //
        //     if (pharmacyRequest && pharmacyRequest.requests) {
        //         const pharmacyReqRes = await PatientRequestHelper.handlePharmacyRequest(pharmacyRequest, patient, createdBy);
        //         if (pharmacyReqRes.success) {
        //             // save transaction
        //             await RequestPaymentHelper.pharmacyPayment(pharmacyRequest.requests, patient, createdBy);
        //         }
        //
        //         visit.pharmacyRequest = pharmacyReqRes.data;
        //     }
        //
        //     if (imagingRequest && imagingRequest.requests) {
        //         const radiologyRes = await PatientRequestHelper.handleImagingRequest(imagingRequest, patient, createdBy);
        //         if (radiologyRes.success) {
        //             // save transaction
        //             await RequestPaymentHelper.imagingPayment(imagingRequest.requests, patient, createdBy);
        //         }
        //         visit.radiologyRequest = radiologyRes.data;
        //     }
        //     await visit.save();
        //     return {success: true, visit};
        // } catch (err) {
        //     return {success: false, message: err.message};
        // }
    }

    async getPatientAntenatalVisits(options: PaginationOptionsInterface, {patient_id, startDate, endDate}) {
        const query = this.antenatalVisitRepository.createQueryBuilder('q')
                            .select('q.*');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('"q"."patientId" = :patient_id', {patient_id});
        }

        const results = await query.take(options.limit)
                            .skip(options.page * options.limit)
                            .orderBy('q.createdAt', 'DESC')
                            .getRawMany();

        for (const result of results) {
            // TODO: fix lab
            // if (result.lab_request) {
            //     result.labRequest = await this.patientRequestRepository.findOne(result.lab_request);
            // }

            if (result.radiology_request) {
                result.radiologyRequest = await this.patientRequestRepository.findOne(result.radiology_request);
            }

            if (result.pharmacy_request) {
                result.pharmacyRequest = await this.patientRequestRepository.findOne(result.pharmacy_request);
            }
        }
        return results;

    }
}
