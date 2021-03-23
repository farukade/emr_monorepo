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
import { Patient } from '../../patient/entities/patient.entity';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { ServiceCategoryRepository } from '../../settings/services/service.category.repository';
import { AppGateway } from '../../../app.gateway';
import { getRepository } from 'typeorm';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { HmoRepository } from '../../hmo/hmo.repository';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../../common/paginate';

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
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
        private readonly appGateway: AppGateway,
    ) {
    }

    async todaysAppointments({ type }): Promise<Appointment[]> {
        if (!type) {
            type = 'in-patient';
        }
        const today = moment().format('YYYY-MM-DD');
        const appointments = await this.appointmentRepository.find({
            where: { appointment_date: today, appointmentType: type, canSeeDoctor: 1 },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction'],
        });
    }

    async patientAppointments(id: number): Promise<Appointment[]> {
        const patient = await this.patientRepository.findOne(id);

        const appointments = await this.appointmentRepository.find({
            where: { patient },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction'],
        });

        for (const item of appointments) {
            if (item.patient) {
                let patient = item.patient;
                if (patient.profile_pic) {
                    patient.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${patient.profile_pic}`;
                }
                item.patient = patient;
            }
        }
        return appointments;
    }

    async patientsAppointments({ type }): Promise<Appointment[]> {
        if (!type) {
            type = 'in-patient';
            
        const appointments = await this.appointmentRepository.find({
            where: { appointmentType: type, canSeeDoctor: 1 },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction'],
        });

        for (const item of appointments) {
            if (item.patient) {
                let patient = item.patient;
                if (patient.profile_pic) {
                    patient.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${patient.profile_pic}`;
                }
                item.patient = patient;
            }
        }
        return appointments;
    }

    async getAppointment(id: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction'],
        });

        if (appointment.patient) {
            let patient = appointment.patient;
            if (patient.profile_pic) {
                patient.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${patient.profile_pic}`;
            }
            appointment.patient = patient;
        }

        return appointment;

    }

    async saveNewAppointment(appointmentDto: AppointmentDto): Promise<any> {
        try {
            const { patient_id, consulting_room_id, doctor_id, sendToQueue, serviceType, serviceCategory, amount } = appointmentDto;
            console.log(amount);
            // find patient details
            const patient = await this.patientRepository.findOne(patient_id);
            if (!patient) {
                return { success: false, message: 'please select a patient' };
            }

            // find doctor
            const doctor = await getRepository(StaffDetails).findOne(doctor_id);
            // find consulting room
            const consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);
            // find service
            const service = await this.serviceRepository.findOne(serviceType);
            // find service category
            const category = await this.serviceCategoryRepository.findOne(serviceCategory);

            const appointment = await this.appointmentRepository.saveAppointment(
                appointmentDto, patient, consultingRoom, doctor, amount, service, category,
            );
            // update patient appointment date
            patient.lastAppointmentDate = new Date().toString();
            await patient.save();

            let queue;
            let paymentType = '';
            let hmoApprovalStatus = 0;
            // add patient
            appointment.patient = patient;

            if (sendToQueue) {
                if (amount) {
                    const hmo = await this.hmoRepository.findOne(patient.hmo);
                    if (hmo.name !== 'Private') {
                        paymentType = 'HMO';
                        hmoApprovalStatus = 1;
                        // update appointment status
                        appointment.status = 'Pending HMO Approval';

                        await appointment.save();
                        // save HMO queue
                        queue = await this.queueSystemRepository.saveQueue(appointment, 'hmo');
                    } else {
                        // update appointment status
                        appointment.status = 'Pending Paypoint Approval';
                        await appointment.save();
                        // save paypoint queue
                        queue = await this.queueSystemRepository.saveQueue(appointment, 'paypoint');
                    }

                    // save payment
                    const payment = await this.saveTransaction(patient, service, amount, paymentType, hmoApprovalStatus);
                    appointment.transaction = payment;
                    await appointment.save();
                    // send queue message
                    this.appGateway.server.emit('paypoint-queue', { queue, payment });
                } else {
                    queue = await this.queueSystemRepository.saveQueue(appointment, 'vitals');
                    this.appGateway.server.emit('nursing-queue', { queue });
                }

                this.appGateway.server.emit('all-queues', { queue });

                console.log(appointment.transaction);
            }
            const resp = { success: true, appointment };

            // go to front desk
            this.appGateway.server.emit('new-appointment', resp);
            return resp;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async listAppointments(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id } = params;
        let type = params.type;
        if (!type) {
            type = 'in-patient';
        }
        const query = this.appointmentRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.whomToSee', 'doctor')
            .leftJoinAndSelect('q.patient', 'patient')
            .leftJoinAndSelect('q.consultingRoom', 'consultingRoom')
            .leftJoinAndSelect('q.encounter', 'encounter')
            .leftJoinAndSelect('q.transaction', 'transaction')
            .where('q.appointmentType = :type', { type });

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.appointment_date >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.appointment_date <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', { patient_id });
        }

        const appointments = await query.offset(options.page * options.limit)
        .limit(options.limit)
        .orderBy('q.createdAt', 'DESC')
        .getMany();

        const total = await query.getCount();

        for (const item of appointments) {
            if (item.patient) {
                let patient = item.patient;
                if (patient.profile_pic) {
                    patient.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${patient.profile_pic}`;
                }
                item.patient = patient;
            }
        }
       
        return {
            result: appointments,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page + 1,
        };
    }

    async getActivePatientAppointment(patient_id) {
        return await this.appointmentRepository
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .where('appointment.patient_id = :patient_id', { patient_id })
            .andWhere('appointment.isActive = :status', { status: true })
            .getOne();
    }

    async checkAppointmentStatus(params) {
        const { patient_id, service_id } = params;
        // find service
        const service = await this.serviceRepository.findOne(service_id);
        let resGracePeriod;
        let resNoOfVisits;
        if (service.gracePeriod) {
            const gracePeriodParams = service.gracePeriod.split(' ');
            resGracePeriod = await this.verifyGracePeriod(gracePeriodParams, patient_id, service_id);
        }

        if (service.noOfVisits) {
            resNoOfVisits = await this.verifyNoOfVisits(service.noOfVisits, patient_id, service_id);
        }

        if (resGracePeriod && resNoOfVisits) {
            return { isPaying: false, amount: 0 };
        } else {
            return { isPaying: true, amount: parseInt(service.tariff, 10) };
        }
    }

    async closeAppointment(id) {
        // find appointment
        const appointment = await this.appointmentRepository.findOne(id);
        // update status
        appointment.isActive = false;
        await appointment.save();
        // remove from queue
        await this.queueSystemRepository.delete({ appointment });
        return appointment;
    }

    async cancelAppointment(id, username) {
        // find appointment
        const appointment = await this.appointmentRepository.findOne(id);
        // update status
        appointment.isActive = false;
        await appointment.save();
        // remove from queue
        await this.queueSystemRepository.delete({ appointment });
        return await appointment.softRemove();
    }

    async updateDoctorStatus({ appointmentId, action }, user) {
        try {
            const appointment = await this.getAppointment(appointmentId);
            appointment.doctorStatus = action;
            await appointment.save();
            this.appGateway.server.emit('appointment-update', { appointment, action });
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    private async saveTransaction(patient: Patient, service: Service, amount, paymentType, hmoApprovalStatus) {

        const data = {
            patient,
            serviceType: service,
            next_location: 'vitals',
            amount,
            description: service.name,
            payment_type: paymentType,
            transaction_type: 'billing',
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
            .where('appointment.patient_id = :patient_id', { patient_id })
            .andWhere('appointment.service_id = :service_id', { service_id })
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
            .where('appointment.patient_id = :patient_id', { patient_id })
            .andWhere('appointment.service_id = :service_id', { service_id })
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
