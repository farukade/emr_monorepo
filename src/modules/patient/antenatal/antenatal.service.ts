import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AntenatalEnrollmentRepository } from './enrollment.repository';
import { EnrollmentDto } from './dto/enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientAntenatal } from '../entities/patient_antenatal.entity';
import * as moment from 'moment';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { AntenatalVisitRepository } from './antenatal-visits.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { getStaff } from '../../../common/utils/utils';
import { AntenatalEnrollment } from './entities/antenatal-enrollment.entity';
import { AntenatalPackageRepository } from '../../settings/antenatal-packages/antenatal-package.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { getConnection } from 'typeorm';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { AntenatalVisits } from './entities/antenatal-visits.entity';
import { PatientNote } from '../entities/patient_note.entity';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';

@Injectable()
export class AntenatalService {
    constructor(
        @InjectRepository(AntenatalEnrollmentRepository)
        private enrollmentRepository: AntenatalEnrollmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(AntenatalVisitRepository)
        private antenatalVisitRepository: AntenatalVisitRepository,
        @InjectRepository(PatientRequestRepository)
        private patientRequestRepository: PatientRequestRepository,
        @InjectRepository(AntenatalPackageRepository)
        private antenatalPackageRepository: AntenatalPackageRepository,
        @InjectRepository(AdmissionsRepository)
        private admissionsRepository: AdmissionsRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(PatientNoteRepository)
        private patientNoteRepository: PatientNoteRepository,
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
    ) {
    }

    async getAntenatals(options: PaginationOptionsInterface, urlParams): Promise<Pagination> {
        const { startDate, endDate, patient_id } = urlParams;

        const page = options.page - 1;

        const query = this.enrollmentRepository.createQueryBuilder('q').select('q.*');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', { patient_id });
        }

        const antenatals = await query.offset(page * options.limit)
          .limit(options.limit)
          .orderBy('q.createdAt', 'DESC')
          .getRawMany();

        const total = await query.getCount();

        let result = [];
        for (const antenatal of antenatals) {
            antenatal.patient = await this.patientRepository.findOne(antenatal.patient_id, { relations: ['hmo'] });

            antenatal.staff = await getStaff(antenatal.createdBy);
            antenatal.package = await this.antenatalPackageRepository.findOne(antenatal.package_id);

            result = [...result, antenatal];
        }

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async saveEnrollment(createDto: EnrollmentDto, createdBy) {
        try {
            const { patient_id, bookingPeriod, doctors, lmp, lmpSource, edd, father, history, previousPregnancy, enrollment_package_id } = createDto;

            const requestCount = await getConnection()
              .createQueryBuilder()
              .select('*')
              .from(AntenatalEnrollment, 'q')
              .getCount();

            const nextId = `00000${requestCount + 1}`;
            const code = `ANC/${moment().format('MM')}/${nextId.slice(-5)}`;

            const ancpackage = await this.antenatalPackageRepository.findOne(enrollment_package_id);

            // find patient
            const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

            const admission = await this.admissionsRepository.findOne({ where: { patient } });

            const enrollment = new AntenatalEnrollment();
            enrollment.serial_code = code;
            enrollment.patient = patient;
            enrollment.booking_period = bookingPeriod;
            enrollment.doctors = doctors;
            enrollment.lmp = lmp;
            enrollment.lmp_source = lmpSource;
            enrollment.edd = edd;
            enrollment.father = father;
            enrollment.history = history;
            enrollment.pregnancy_history = previousPregnancy;
            enrollment.package = ancpackage;
            enrollment.createdBy = createdBy;
            const rs = await this.enrollmentRepository.save(enrollment);

            if (ancpackage) {
                const data = {
                    patient,
                    amount: ancpackage.amount,
                    description: 'Payment for ANC',
                    payment_type: 'self',
                    bill_source: 'anc',
                    createdBy,
                    status: -1,
                    hmo: patient.hmo,
                    is_admitted: (admission !== null),
                    transaction_type: 'debit',
                    balance: ancpackage.amount * -1,
                };

                await this.transactionsRepository.save(data);
            }

            return { success: true, enrollment: rs };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
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

    async getAssessments(id: number, options: PaginationOptionsInterface): Promise<Pagination> {
        const page = options.page - 1;

        const query = this.antenatalVisitRepository.createQueryBuilder('q')
          .select('q.*')
          .where('q.antenatal_enrollment_id = :antenatal_id', { antenatal_id: id });

        const visits = await query.offset(page * options.limit)
          .limit(options.limit)
          .orderBy('q.createdAt', 'DESC')
          .getRawMany();

        const total = await query.getCount();

        let results = [];
        for (const item of visits) {
            item.staff = await getStaff(item.createdBy);
            item.comment = await this.patientNoteRepository.findOne(item.note_id);

            results = [...results, item];
        }

        return {
            result: results,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async saveAntenatalVisits(id, params, createdBy: string) {
        try {
						const { patient_id, measurement, position_of_foetus, fetal_lie, brim, comment, investigation, nextAppointment, appointment_id } = params;
						const { labRequest, radiologyRequest, pharmacyRequest } = investigation;

						const patient = await this.patientRepository.findOne(patient_id);
						const antenatalEnrolment = await this.enrollmentRepository.findOne(id);

						const note = new PatientNote();
						note.patient = patient;
						note.description = comment;
						note.type = 'anc-comment';
						note.antenatal = antenatalEnrolment;
						note.createdBy = createdBy;
						const savedNote = await note.save();

						const assessment = new AntenatalVisits();
						assessment.antenatalEnrolment = antenatalEnrolment;
						assessment.patient = patient;
						assessment.measurement = measurement;
						assessment.position_of_foetus = position_of_foetus;
						assessment.fetal_lie = fetal_lie;
						assessment.relationship_to_brim = brim;
						assessment.comment = savedNote;
						assessment.createdBy = createdBy;
						await assessment.save();

						if (labRequest) {
                const lab = await PatientRequestHelper.handleLabRequest(labRequest, patient, createdBy);
                if (lab.success) {
                    // save transaction
                    // tslint:disable-next-line:max-line-length
                    const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, patient, createdBy, labRequest.pay_later);
                }
            }

						if (radiologyRequest) {
                const request = await PatientRequestHelper.handleServiceRequest(radiologyRequest, patient, createdBy, 'scans');
                if (request.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.servicePayment(
                      request.data,
                      patient,
                      createdBy,
                      'scans',
                      radiologyRequest.pay_later,
                    );
                }
            }

						if (pharmacyRequest) {
                await PatientRequestHelper.handlePharmacyRequest(pharmacyRequest, patient, createdBy);
            }

						if (nextAppointment && nextAppointment.appointment_date && nextAppointment.appointment_date !== '') {
                const appointment = await this.appointmentRepository.findOne({
                    where: { id: appointment_id },
                    relations: ['patient', 'whomToSee', 'consultingRoom', 'transaction', 'department'],
                });

                const newAppointment = new Appointment();
                newAppointment.patient = patient;
                newAppointment.whomToSee = appointment.whomToSee;
                newAppointment.appointment_date = nextAppointment.appointment_date;
                newAppointment.duration = nextAppointment.duration;
                newAppointment.duration_type = nextAppointment.duration_type;
                newAppointment.serviceCategory = appointment.serviceCategory;
                newAppointment.service = appointment.service;
                newAppointment.description = nextAppointment.description;
                newAppointment.department = appointment.department;
                newAppointment.createdBy = createdBy;
                await newAppointment.save();
            }

						return {success: true, assessment};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }
}
