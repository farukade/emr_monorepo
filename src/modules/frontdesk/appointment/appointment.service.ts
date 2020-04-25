import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentDto } from './dto/appointment.dto';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { SpecializationRepository } from '../../settings/specialization/specialization.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ConsultingRoomRepository } from '../../settings/consulting-room/consulting-room.repository';
import { Appointment } from './appointment.entity';
import * as moment from 'moment';
import { QueueSystemRepository } from '../queue-system/queue-system.repository';
import { Service } from '../../settings/entities/service.entity';
import { ServiceRepository } from '../../settings/services/service.repository';
import { Queue } from '../queue-system/queue.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { Department } from '../../settings/entities/department.entity';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { ServiceCategoryRepository } from '../../settings/services/service.category.repository';

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(SpecializationRepository)
        private specializationRepository: SpecializationRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(ConsultingRoomRepository)
        private consultingRoomRepository: ConsultingRoomRepository,
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
    ) {}

    async todaysAppointments(): Promise<Appointment[]> {
        const today = moment().format('YYYY-MM-DD');
        const results = this.appointmentRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.department', 'department')
            .leftJoinAndSelect('q.patient', 'patient')
            .leftJoinAndSelect('q.specialization', 'specialization')
            .select('q.*, department.name as dept_name, specialization.name as specialization')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.fileNumber')
            .where(`q.appointment_date = '${today}'`)
            .getRawMany();

        return results;
    }

    async getAppointment(id: string): Promise<Appointment> {
        const result = await this.appointmentRepository.findOne({
            where: {id},
            relations: ['department', 'patient', 'specialization', 'consultingRoom'],
        });

        return result;
    }

    async saveNewAppointment(appointmentDto: AppointmentDto): Promise<any> {
        try {
            const { patient_id, department_id, specialization_id, consulting_room_id, sendToQueue, serviceType, serviceCategory, amount} = appointmentDto;
            // find patient details
            const patient = await this.patientRepository.findOne(patient_id);
            // find department details
            const department = await this.departmentRepository.findOne(department_id);
            // find specialization
            const specialization = await this.specializationRepository.findOne(specialization_id);
            // find consulting room
            const consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);
            // find service
            const service = await this.serviceRepository.findOne(serviceType);
            // find service category
            const category = await this.serviceCategoryRepository.findOne(serviceCategory);

            const appointment = await this.appointmentRepository.saveAppointment(appointmentDto, patient, specialization, department, consultingRoom, service, category);
            // update patient appointment date
            patient.lastAppointmentDate = new Date().toString();
            await patient.save();

            let queue;
            let paymentType = '';
            let hmoApprovalStatus = 0;
            
            if (sendToQueue) {
                if (patient.insurranceStatus === 'HMO') {
                    paymentType  = 'HMO';
                    hmoApprovalStatus = 1;
                    // update appointment status
                    appointment.status = 'Pending HMO Approval';
                    await appointment.save();
                } else {
                    const paypoint = await this.departmentRepository.findOne({where: {name: 'Paypoint'}});

                    queue = await this.queueSystemRepository.saveQueue(appointment, paypoint);
                    // update appointment status
                    appointment.status = 'Pending Paypoint Approval';
                    await appointment.save();
                }
            }
            // save payment
            const payment = await this.saveTransaction(patient, service, amount, paymentType, hmoApprovalStatus);

            return { success: true, appointment, queue, payment };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async listAppointments(params) {
        const {startDate, endDate} = params;
        const query = this.appointmentRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.department', 'department')
            .leftJoinAndSelect('q.patient', 'patient')
            .leftJoinAndSelect('q.specialization', 'specialization')
            .select('q.*, department.name as dept_name, specialization.name as specialization')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.fileNumber');
        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        const result = await query.getRawMany();

        return result;
    }

    async checkAppointmentStatus(params) {
        const {patient_id, service_id} = params;
        // find service
        const service = await this.serviceRepository.findOne(service_id);

        let resGracePeriod, resNoOfVisits;

        if (service.gracePeriod) {
            const gracePeriodParams = service.gracePeriod.split(' ');
            resGracePeriod = await this.verifyGracePeriod(gracePeriodParams, patient_id, service_id);
        }

        if (service.noOfVisits) {
            resNoOfVisits = await this.verifyNoOfVisits(service.noOfVisits, patient_id, service_id);
        }

        if (resGracePeriod && resNoOfVisits) {
            return {isPaying: false, amount: 0};
        } else {
            return {isPaying: true, amount: parseInt(service.tariff, 10)};
        }
    }

    private async saveTransaction(patient: Patient, service: Service, amount, paymentType, hmoApprovalStatus) {
        const department = await this.departmentRepository.findOne({where: {name: 'Vitals'}});

        const data = {
            patient,
            serviceType: service,
            department,
            amount,
            description: service.name,
            payment_type: paymentType,
            hmo_approval_status: hmoApprovalStatus,
        };
        const transaction = await this.transactionsRepository.save(data);
        return transaction;
    }

    private isWithinGracePeriod(lastVisit, gracePeriod) {
        return lastVisit.isAfter(gracePeriod);
    }

    private async verifyGracePeriod(gracePeriodParams, patient_id, service_id) {
         // find patient last appointment
        const appointments = await this.appointmentRepository.createQueryBuilder('appointment')
            .where('appointment.patient_id = :patient_id', {patient_id})
            .andWhere('appointment.service_id = :service_id', {service_id})
            .select(['appointment.createdAt as created_at'])
            .orderBy('appointment.createdAt', 'DESC')
            .limit(gracePeriodParams[0])
            .getRawMany();
        let result = true;
        if (appointments.length) {
            for (const appointment of appointments) {
                const lastVisit = moment(appointments[0].created_at);
                const gracePeriod = moment().subtract(gracePeriodParams[0], gracePeriodParams[1]).startOf('day');
                if (!this.isWithinGracePeriod(lastVisit, gracePeriod)) {
                    result = false;
                    return;
                }
            }
        }
        return result;
    }

    private async verifyNoOfVisits(noOfVisits, patient_id, service_id) {
        const appointments = await this.appointmentRepository.createQueryBuilder('appointment')
            .where('appointment.patient_id = :patient_id', {patient_id})
            .andWhere('appointment.service_id = :service_id', {service_id})
            .select(['appointment.createdAt as created_at'])
            .orderBy('appointment.createdAt', 'DESC')
            .limit(noOfVisits)
            .getRawMany();
        if (appointments.length < noOfVisits) {
            return true;
        } else {
            return false;
        }
    }
}
