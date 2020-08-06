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
import { AppGateway } from '../../../app.gateway';
import {getRepository} from "typeorm";
import {StaffDetails} from "../../hr/staff/entities/staff_details.entity";

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
        private readonly appGateway: AppGateway,
    ) {}

    async todaysAppointments(): Promise<Appointment[]> {
        const today = moment().format('YYYY-MM-DD');
        return await this.appointmentRepository.find({
            where: {appointment_date: today},
            relations: ['department', 'patient', 'specialization', 'consultingRoom', 'encounter'],
        });

    }

    async getAppointment(id: string): Promise<Appointment> {
        return await this.appointmentRepository.findOne({
            where: {id},
            relations: ['department', 'patient', 'specialization', 'consultingRoom', 'encounter'],
        });

    }

    async saveNewAppointment(appointmentDto: AppointmentDto): Promise<any> {
        try {
            const { patient_id, consulting_room_id, doctor_id, sendToQueue, serviceType, serviceCategory, amount} = appointmentDto;
            // find patient details
            const patient = await this.patientRepository.findOne(patient_id);
            // find doctor
            const doctor = await getRepository(StaffDetails).findOne(doctor_id);
             // find consulting room
            const consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);
            // find service
            const service = await this.serviceRepository.findOne(serviceType);
            // find service category
            const category = await this.serviceCategoryRepository.findOne(serviceCategory);

            const appointment = await this.appointmentRepository.saveAppointment(appointmentDto, patient, consultingRoom, doctor, amount, service, category);
            // update patient appointment date
            patient.lastAppointmentDate = new Date().toString();
            await patient.save();

            let queue;
            let paymentType = '';
            let hmoApprovalStatus = 0;
            
            if (sendToQueue) {
                if (amount) {
                    if (patient.insurranceStatus === 'HMO') {
                        paymentType = 'HMO';
                        hmoApprovalStatus = 1;
                        // update appointment status
                        appointment.status = 'Pending HMO Approval';
                        await appointment.save();
                        // save HMO queue
                        queue = await this.queueSystemRepository.saveQueue(appointment, 'hmo');
                    } else {
                        // update appointment status
                        appointment.status = 'Pending Account Approval';
                        await appointment.save();
                        // save paypoint queue
                        queue = await this.queueSystemRepository.saveQueue(appointment, 'paypoint');
                    }
                    // save payment
                    const payment = await this.saveTransaction(patient, service, amount, paymentType, hmoApprovalStatus);
                    // send queue message
                    this.appGateway.server.emit('new-queue', {queue, payment});
                } else {
                    queue = await this.queueSystemRepository.saveQueue(appointment, 'vitals');
                    this.appGateway.server.emit('new-queue', {queue});
                }
            }
            const resp = { success: true, appointment};

            this.appGateway.server.emit('new-appointment', resp);
            return resp;
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
            .leftJoinAndSelect('q.consultingRoom', 'consultingRoom')
            .leftJoinAndSelect('q.encounter', 'encounter');

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        const result = await query.getMany();

        return result;
    }

    async getActivePatientAppointment(patient_id) {
        return await this.appointmentRepository
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .where('appointment.patient_id = :patient_id', {patient_id})
            .andWhere('appointment.isActive = :status', {status: true})
            .getOne();
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

    async closeAppointment(id) {
        //find appointment
        const appointment = await this.appointmentRepository.findOne(id);
        // update status
        appointment.isActive = false;
        await appointment.save();
        // remove from queue
        await this.queueSystemRepository.delete( {appointment});
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
        return await this.transactionsRepository.save(data);
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
