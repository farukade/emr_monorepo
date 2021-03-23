import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { EncounterDto } from './dto/encounter.dto';
import { Encounter } from './encouter.entity';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientAllergyRepository } from '../repositories/patient_allergy.repository';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PaginationOptionsInterface } from '../../../common/paginate';
import * as moment from 'moment';

@Injectable()
export class ConsultationService {
    constructor(
        @InjectRepository(EncounterRepository)
        private allergyRepository: PatientAllergyRepository,
        @InjectRepository(EncounterRepository)
        private encounterRepository: EncounterRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
    ) {}

    async getEncounters(options: PaginationOptionsInterface, urlParams): Promise<Encounter[]> {
        const {startDate, endDate, patient_id} = urlParams;

        const query = this.encounterRepository.createQueryBuilder('e');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`e.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`e.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patientId = :patient_id', {patient_id});
        }

        return await query.take(options.limit)
                            .skip(options.page * options.limit)
                            .orderBy('e.createdAt', 'DESC')
                            .getRawMany();
    }

    async saveEncounter(patient_id: string, param: EncounterDto, createdBy) {
        const { investigations, plan, consumable, appointment_id } = param;
        try {
            const patient = await this.patientRepository.findOne(patient_id);

            const appointment = await this.appointmentRepository.findOne(appointment_id);

            const encounter = new Encounter();
            encounter.complaints = param.complaints;
            encounter.reviewOfSystem = param.reviewOfSystem;
            encounter.patientHistory = param.patientHistory;
            encounter.medicalHistory = param.medicalHistory;
            encounter.patient        = patient;
            // encounter.appointment    = appointment;
            // save allergy if any
            if (param.allergies.length) {
                encounter.allergies = param.allergies;
                for (const allergy of param.allergies) {
                    const data = {
                        category: allergy.category,
                        allergen: allergy.allergen,
                        severity: allergy.severity,
                        reaction: allergy.reaction,
                        patient,
                    };
                    this.allergyRepository.save(data);
                }
            }
            encounter.physicalExamination = param.physicalExamination;
            encounter.physicalExaminationSummary = param.physicalExaminationSummary;
            encounter.diagnosis = param.diagnosis;

            const labRequest    = param.investigations.labRequest;
            const imagingRequest = param.investigations.imagingRequest;
            const pharmacyRequest = plan.pharmacyRequests;
            const procedureRequest = plan.procedureRequest;

            // save request
            if (labRequest) {
                const labRequestRes = await PatientRequestHelper.handleLabRequest(labRequest, patient, createdBy);
                if (labRequestRes.success) {
                    // save transaction
                    await RequestPaymentHelper.clinicalLabPayment(labRequest.items, patient, createdBy);
                    encounter.labRequest = labRequestRes.data;
                }
            }

            if (pharmacyRequest) {
                const pharmacyReqRes = await PatientRequestHelper.handlePharmacyRequest(pharmacyRequest, patient, createdBy);
                if (pharmacyReqRes.success) {
                    // save transaction
                    await RequestPaymentHelper.pharmacyPayment(pharmacyRequest.items, patient, createdBy);
                    encounter.pharmacyRequest = pharmacyReqRes.data;
                }
            }

            if (imagingRequest) {
                const radiologyRes = await PatientRequestHelper.handleImagingRequest(imagingRequest, patient, createdBy);
                if (radiologyRes.success) {
                    // save transaction
                    await RequestPaymentHelper.imagingPayment(imagingRequest.items, patient, createdBy);
                    encounter.imagingRequest = radiologyRes.data;
                }
            }

            if (procedureRequest && procedureRequest.requests) {
                const procedure = await PatientRequestHelper.handleImagingRequest(procedureRequest, patient, createdBy);
                if (procedure.success) {
                    // save transaction
                    await RequestPaymentHelper.imagingPayment(procedureRequest.items, patient, createdBy);
                    encounter.procedure = procedure.data;
                }
            }

            if (param.consumable.items && param.consumable.items.length) {
                encounter.consumable = param.consumable.items;
            }
            encounter.note = param.consumable.note;
            encounter.instructions = param.consumable.instruction;
            encounter.plan = plan.treatmentPlan;
            encounter.nextAppointment = plan.nextAppointment;

            await encounter.save();
            // save appointment
            // appointment.encounter = encounter;
            // await appointment.save();

            return {success: true, encounter};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async getEncounter(id: string) {
        return await this.encounterRepository.findOne(id);
    }
}
