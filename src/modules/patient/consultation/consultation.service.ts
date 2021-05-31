import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { EncounterDto } from './dto/encounter.dto';
import { Encounter } from './encouter.entity';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PaginationOptionsInterface } from '../../../common/paginate';
import * as moment from 'moment';
import { PatientAllergenRepository } from '../repositories/patient_allergen.repository';
import { PatientNote } from '../entities/patient_note.entity';
import { PatientAllergen } from '../entities/patient_allergens.entity';
import { StockRepository } from '../../inventory/stock.repository';
import { PatientDiagnosis } from '../entities/patient_diagnosis.entity';
import { PatientPastDiagnosis } from '../entities/patient_past_diagnosis.entity';
import { PatientPhysicalExam } from '../entities/patient_physical_exam.entity';
import { PatientReviewOfSystem } from '../entities/patient_review_of_system.entity';
import { AppGateway } from '../../../app.gateway';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { PatientHistory } from '../entities/patient_history.entity';
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { ConsumableRepository } from '../../settings/consumable/consumable.repository';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { AuthRepository } from '../../auth/auth.repository';
import { Connection } from 'typeorm';

@Injectable()
export class ConsultationService {
    constructor(
        private connection: Connection,
        private readonly appGateway: AppGateway,
        @InjectRepository(PatientAllergenRepository)
        private allergenRepository: PatientAllergenRepository,
        @InjectRepository(EncounterRepository)
        private encounterRepository: EncounterRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        @InjectRepository(StockRepository)
        private stockRepository: StockRepository,
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        @InjectRepository(ConsumableRepository)
        private consumableRepository: ConsumableRepository,
        @InjectRepository(AuthRepository)
        private readonly authRepository: AuthRepository,
    ) {
    }

    async getEncounters(options: PaginationOptionsInterface, urlParams): Promise<any> {
        const { startDate, endDate, patient_id } = urlParams;
        const query = this.encounterRepository.createQueryBuilder('e')
            .select('e.*');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`e.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`e.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('e.patient_id = :patient_id', { patient_id });
        }

        const page = options.page - 1;

        const total = await query.getCount();

        const items = await query.orderBy('e.createdAt', 'DESC')
            .take(options.limit)
            .skip(page * options.limit)
            .getRawMany();

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();

        // lets now open a new transaction:
        await queryRunner.startTransaction();

        let result = [];
        try {

            for (const item of items) {
                const patient = await this.patientRepository.findOne(item.patient, {
                    relations: ['nextOfKin', 'immunization', 'hmo'],
                });
    
                const staff = await this.authRepository.findOne({ where: {username: item.createdBy}, relations: ['details']});
    
                item.patient = patient;
                item.staff = staff;
                const encounter_id = item.id;
                const pns = await queryRunner.manager.createQueryBuilder(PatientNote, 'patient_notes')
                .where('patient_notes.encounter_id = :encounter_id', { encounter_id: encounter_id }).getMany();


                const pallg = await queryRunner.manager.createQueryBuilder(PatientAllergen, 'patient_allergens')
                .where('patient_allergens.encounter_id = :encounter_id', { encounter_id: encounter_id }).getMany();
                
              
                const pd = await queryRunner.manager.createQueryBuilder(PatientDiagnosis, 'patient_diagnoses')
                .where('patient_diagnoses.encounter_id = :encounter_id', { encounter_id: encounter_id }).getMany();
                
                
                const ph = await queryRunner.manager.findOne(PatientHistory,{where: { encounter: item }});
               
                const pros = await queryRunner.manager.createQueryBuilder(PatientReviewOfSystem, 'patient_review_of_systems')
                .where('patient_review_of_systems.encounter_id = :encounter_id', { encounter_id: encounter_id }).getMany();
                
               
                const ppe = await queryRunner.manager.createQueryBuilder(PatientPhysicalExam, 'patient_physical_exams')
                .where('patient_physical_exams.encounter_id = :encounter_id', { encounter_id: encounter_id }).getMany();
 
                const pc = await queryRunner.manager.createQueryBuilder(PatientConsumable, 'patient_consumables')
                .where('patient_consumables.encounter_id = :encounter_id', { encounter_id: encounter_id }).getMany();
                console.log(ph)
                item.patient_diagnoses = pd;
                item.patient_allergens = pallg;
                item.patient_history = ph;
                item.patient_review_of_systems = pros;
                item.patient_physical_exams = ppe;
                item.patient_consumables = pc;

                for(const note of pns){
                    switch(note.type){
                        case 'complaints':
                           item.complaints = note;
                        case 'treatment-plan':
                            item.treatment_plan = note;
                        case 'instruction':
                            item.instruction = note;
                    }
                }
    
                result = [...result, item];
            }

            return {
                result,
                lastPage: Math.ceil(total / options.limit),
                itemsPerPage: options.limit,
                totalPages: total,
                currentPage: options.page,
            };

        } catch (err) {
            await queryRunner.rollbackTransaction();
            return { success: false, error: `${err.message || 'problem fecthcing encounter at the moment please try again later'}`}
        } finally {
            await queryRunner.release();
        }

    }

    async saveEncounter(patientId: number, param: EncounterDto, urlParam, createdBy) {
        const { appointment_id } = urlParam;
        const { investigations, nextAppointment } = param;
        console.log(param.medicalHistory);

        try {
            const patient = await this.patientRepository.findOne(patientId, { relations: ['hmo'] });

            const appointment = await this.appointmentRepository.findOne({
                where: { id: appointment_id },
                relations: ['patient', 'whomToSee', 'serviceType', 'consultingRoom', 'transaction', 'department'],
            });

            const encounter = new Encounter();
            encounter.patient = patient;
            encounter.createdBy = createdBy;
            await encounter.save();

            const complain = param.complaints.replace(/(<([^>]+)>)/gi, '')
                .replace(/&nbsp;/g, '')
                .replace('Presenting Complaints', '')
                .replace('History of complains', '')
                .replace(/\s/g, '')
                .replace(/\/r/g, '')
                .split(':').join('');

            if (encodeURIComponent(complain) !== '%E2%80%8B') {
                const complaint = new PatientNote();
                complaint.description = param.complaints;
                complaint.patient = patient;
                complaint.encounter = encounter;
                complaint.type = 'complaints';
                complaint.createdBy = createdBy;
                await complaint.save();
            }

            const treatmentPlan = param.treatmentPlan.replace(/(<([^>]+)>)/gi, '')
                .replace(/&nbsp;/g, '')
                .replace('Treatment Plan', '')
                .replace(/\s/g, '')
                .replace(/\/r/g, '')
                .split(':').join('');

            if (encodeURIComponent(treatmentPlan) !== '%E2%80%8B') {
                const plan = new PatientNote();
                plan.description = param.treatmentPlan;
                plan.patient = patient;
                plan.encounter = encounter;
                plan.type = 'treatment-plan';
                plan.createdBy = createdBy;
                await plan.save();
            }

            if (param.instruction !== '') {
                const instruction = new PatientNote();
                instruction.description = param.instruction;
                instruction.patient = patient;
                instruction.encounter = encounter;
                instruction.type = 'instruction';
                instruction.createdBy = createdBy;
                await instruction.save();
            }

            for (const allergen of param.allergies) {
                const drug = allergen.drug ? await this.stockRepository.findOne(allergen.drug) : null;
                const patientAllergen = new PatientAllergen();
                patientAllergen.category = allergen.category.value;
                patientAllergen.allergy = allergen.allergen;
                patientAllergen.drug = drug;
                patientAllergen.severity = allergen.severity.value;
                patientAllergen.reaction = allergen.reaction;
                patientAllergen.patient = patient;
                patientAllergen.encounter = encounter;
                patientAllergen.createdBy = createdBy;
                await patientAllergen.save();
            }

            for (const diagnosis of param.diagnosis) {
                const patientDiagnosis = new PatientDiagnosis();
                patientDiagnosis.item = diagnosis.diagnosis;
                patientDiagnosis.status = 'Active';
                patientDiagnosis.patient = patient;
                patientDiagnosis.encounter = encounter;
                patientDiagnosis.type = diagnosis.type.value;
                patientDiagnosis.comment = diagnosis.comment;
                patientDiagnosis.createdBy = createdBy;
                await patientDiagnosis.save();
            }


            const his = param.medicalHistory.replace(/(<([^>]+)>)/gi, '')
                .replace(/&nbsp;/g, '')
                .replace('Past Medical History', '')
                .replace(/\s/g, '')
                .replace(/\/r/g, '')
                .split(':').join('');

            if (encodeURIComponent(his) !== '%E2%80%8B') {
                const patHistory = new PatientHistory();
                patHistory.description = param.medicalHistory;
                patHistory.patient = patient;
                patHistory.encounter = encounter;
                patHistory.createdBy = createdBy;
                await patHistory.save();
            }

            // for (const diagnosis of param.medicalHistory) {
            //     const patientDiagnosis = new PatientPastDiagnosis();
            //     patientDiagnosis.item = diagnosis.diagnosis;
            //     patientDiagnosis.diagnosedAt = diagnosis.date;
            //     patientDiagnosis.patient = patient;
            //     patientDiagnosis.encounter = encounter;
            //     patientDiagnosis.comment = diagnosis.comment;
            //     patientDiagnosis.createdBy = createdBy;
            //     await patientDiagnosis.save();
            // }

            for (const exam of param.physicalExamination) {
                const physicalExam = new PatientPhysicalExam();
                physicalExam.category = exam.label;
                physicalExam.description = exam.value;
                physicalExam.patient = patient;
                physicalExam.encounter = encounter;
                physicalExam.createdBy = createdBy;
                await physicalExam.save();
            }

            for (const exam of param.reviewOfSystem) {
                const systemReview = new PatientReviewOfSystem();
                systemReview.category = exam.label;
                systemReview.description = exam.value;
                systemReview.patient = patient;
                systemReview.encounter = encounter;
                systemReview.createdBy = createdBy;
                await systemReview.save();
            }

            if (param.consumables) {
                for (const item of param.consumables.items) {
                    const consumableItem = await this.consumableRepository.findOne(item.item.id);
                    const consumable = new PatientConsumable();
                    consumable.quantity = item.quantity;
                    consumable.consumable = consumableItem;
                    consumable.patient = patient;
                    consumable.encounter = encounter;
                    consumable.requestNote = param.consumables.request_note;
                    consumable.createdBy = createdBy;
                    await consumable.save();
                }
            }

            // for (const item of param.patientHistorySelected) {
            //     const history = new PatientHistory();
            //     history.category = item.category;
            //     history.description = item.description;
            //     history.patient = patient;
            //     history.encounter = encounter;
            //     history.createdBy = createdBy;
            //     await history.save();
            // }

            if (investigations.labRequest) {
                const labRequest = await PatientRequestHelper.handleLabRequest(investigations.labRequest, patient, createdBy);
                if (labRequest.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, patient, createdBy);
                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
            }

            if (investigations.radiologyRequest) {
                const request = await PatientRequestHelper.handleServiceRequest(investigations.radiologyRequest, patient, createdBy, 'radiology');
                if (request.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.servicePayment(request.data, patient, createdBy, 'radiology', 'now');
                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
            }

            if (investigations.procedureRequest) {
                const procedure = await PatientRequestHelper.handleServiceRequest(investigations.procedureRequest, patient, createdBy, 'procedure');
                if (procedure.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.servicePayment(
                        procedure.data,
                        patient,
                        createdBy,
                        'procedure',
                        investigations.procedureRequest.bill,
                    );
                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
            }

            if (investigations.pharmacyRequest) {
                await PatientRequestHelper.handlePharmacyRequest(investigations.pharmacyRequest, patient, createdBy);
            }

            if (nextAppointment) {
                const appointmentDate = `${moment(nextAppointment.appointment_date).format('YYYY-MM-DD')} ${moment().format('HH:mm:ss')}`;

                const newAppointment = new Appointment();
                newAppointment.patient = patient;
                newAppointment.whomToSee = appointment.whomToSee;
                newAppointment.appointment_date = appointmentDate;
                newAppointment.serviceCategory = appointment.serviceCategory;
                newAppointment.serviceType = appointment.serviceType;
                newAppointment.amountToPay = '0.00';
                newAppointment.description = nextAppointment.description;
                newAppointment.department = appointment.department;
                newAppointment.createdBy = createdBy;
                await newAppointment.save();
            }

            appointment.status = 'Completed';
            appointment.encounter = encounter;
            appointment.lastChangedBy = createdBy;
            const rs = await appointment.save();

            await this.queueSystemRepository.delete({ appointment });

            return { success: true, appointment: {...rs, encounter} };
        } catch (err) {
            console.log(err);
            return { success: false, message: err.message };
        }
    }

    async getEncounter(id: string) {
        return await this.encounterRepository.findOne(id);
    }
}
