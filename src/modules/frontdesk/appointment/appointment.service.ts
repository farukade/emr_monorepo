import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentDto } from './dto/appointment.dto';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ConsultingRoomRepository } from '../../settings/consulting-room/consulting-room.repository';
import { Appointment } from './appointment.entity';
import * as moment from 'moment';
import { QueueSystemRepository } from '../queue-system/queue-system.repository';
import { Service } from '../../settings/entities/service.entity';
import { ServiceRepository } from '../../settings/services/repositories/service.repository';
import { Patient } from '../../patient/entities/patient.entity';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { AppGateway } from '../../../app.gateway';
import { Brackets, getConnection, getRepository } from 'typeorm';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { formatPID, getStaff, sendSMS } from '../../../common/utils/utils';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { ServiceCost } from '../../settings/entities/service_cost.entity';

// tslint:disable-next-line:no-var-requires
const Say = require('say').Say;
const say = new Say('darwin' || 'win32' || 'linux');

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(ConsultingRoomRepository)
        private consultingRoomRepository: ConsultingRoomRepository,
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
        private readonly appGateway: AppGateway,
    ) {
    }

    async listAppointments(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id, today, doctor_id, department_id, canSeeDoctor } = params;

        const query = this.appointmentRepository.createQueryBuilder('q')
            .select('q.id');

        if (params.type && params.type !== '') {
            query.where('q.appointmentType = :type', { type: params.type });
        }

        if (canSeeDoctor && canSeeDoctor !== '') {
            query.where('q.canSeeDoctor = :canSeeDoctor', { canSeeDoctor });
        }

        if (today && today !== '') {
            query.andWhere(`CAST(q.appointment_date as text) LIKE '%${today}%'`);
        }

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

        if (doctor_id && doctor_id !== '' && department_id && department_id !== '') {
            console.log('refresh--------------->');
            query.andWhere(new Brackets(qb => {
                qb.where('q.doctor_id = :doctor_id', { doctor_id })
                    .orWhere('q.department_id = :department_id', { department_id });
            }));
        } else {
            if (doctor_id && doctor_id !== '') {
                query.andWhere('q.doctor_id = :doctor_id', { doctor_id });
            }

            if (department_id && department_id !== '') {
                query.andWhere('q.department_id = :department_id', { department_id });
            }
        }

        const page = options.page - 1;

        const appointments = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getMany();

        const total = await query.getCount();

        let items = [];
        for (const item of appointments) {
            const appointment = await this.appointmentRepository.findOne({
                where: { id: item.id },
                relations: ['patient', 'whomToSee', 'consultingRoom', 'transaction', 'department'],
            });

            const patientProfile = await this.patientRepository.findOne({
                where: { id: appointment.patient.id },
                relations: ['hmo', 'immunization', 'nextOfKin'],
            });

            const { patient, ...others } = appointment;
            const appt = { ...others, patient: patientProfile };

            items = [...items, appt];
        }

        return {
            result: items,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async patientAppointments(id: number): Promise<Appointment[]> {
        const patient = await this.patientRepository.findOne(id);

        const appointments = await this.appointmentRepository.find({
            where: { patient },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction', 'department'],
        });

        return appointments;
    }

    async getAppointment(id: number): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction', 'department'],
        });

        return appointment;

    }

    async saveNewAppointment(appointmentDto: AppointmentDto, username: string): Promise<any> {
        try {
            const { patient_id, doctor_id, consulting_room_id, service, sendToQueue, department_id, consultation_id } = appointmentDto;

            // find patient details
            const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });
            if (!patient) {
                return { success: false, message: 'please select a patient' };
            }

            let hmo = patient.hmo;

            // find doctor
            let doctor = null;
            if (doctor_id) {
                doctor = await getRepository(StaffDetails).findOne(doctor_id);
            }

            // find consulting room
            let consultingRoom = null;
            if (consulting_room_id) {
                consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);
            }

            // find service
            let serviceCost = await this.serviceCostRepository.findOne({
                where: { code: service.code, hmo },
            });

            if (!serviceCost || (serviceCost && serviceCost.tariff === 0)) {
                hmo = await this.hmoSchemeRepository.findOne({
                    where: { name: 'Private' },
                });

                serviceCost = await this.serviceCostRepository.findOne({
                    where: { code: service.code, hmo },
                });
            }

            // find department
            const department = await this.departmentRepository.findOne(department_id);

            // tslint:disable-next-line:max-line-length
            const appointment = await this.appointmentRepository.saveAppointment(appointmentDto, patient, consultingRoom, doctor, service, serviceCost, department);

            // update patient appointment date
            patient.lastAppointmentDate = moment().format('YYYY-MM-DD');
            await patient.save();

            let queue;
            let paymentType = null;

            if (hmo.name === 'Private') {
                // update appointment status
                appointment.status = 'Pending Paypoint Approval';
                await appointment.save();
            } else {
                // update appointment status
                paymentType = 'HMO';
                appointment.status = 'Pending HMO Approval';
                await appointment.save();
            }

            if (consultation_id !== 'follow-up') {
                // save payment
                const payment = await this.saveTransaction(patient, hmo, service, serviceCost, paymentType, username, appointment);
                await getConnection()
                    .createQueryBuilder()
                    .update(Appointment)
                    .set({ transaction: payment })
                    .where('id = :id', { id: appointment.id })
                    .execute();

                // send queue message
                if (sendToQueue) {
                    if (hmo.name === 'Private') {
                        queue = await this.queueSystemRepository.saveQueue(appointment, 'paypoint', patient);
                    } else {
                        queue = await this.queueSystemRepository.saveQueue(appointment, 'hmo', patient);
                    }

                    this.appGateway.server.emit('paypoint-queue', { queue, payment });
                }
            } else {
                // send queue message
                if (sendToQueue) {
                    queue = await this.queueSystemRepository.saveQueue(appointment, 'vitals', patient);
                    this.appGateway.server.emit('nursing-queue', { queue });
                }
            }

            if (queue && sendToQueue) {
                this.appGateway.server.emit('all-queues', { queue });
            }

            // go to front desk
            this.appGateway.server.emit('new-appointment', { success: true, appointment });

            return { success: true, appointment };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    async getActivePatientAppointment(patientId) {
        return await this.appointmentRepository
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .where('appointment.patient_id = :patient_id', { patientId })
            .andWhere('appointment.isActive = :status', { status: true })
            .getOne();
    }

    async checkAppointmentStatus(params) {
        const { patient_id, service_id } = params;
        // find service
        const service = await this.serviceRepository.findOne(service_id);
        // let resGracePeriod;
        // let resNoOfVisits;
        // if (service.gracePeriod) {
        //     const gracePeriodParams = service.gracePeriod.split(' ');
        //     resGracePeriod = await this.verifyGracePeriod(gracePeriodParams, patient_id, service_id);
        // }
        //
        // if (service.noOfVisits) {
        //     resNoOfVisits = await this.verifyNoOfVisits(service.noOfVisits, patient_id, service_id);
        // }

        // if (resGracePeriod && resNoOfVisits) {
        //     return { isPaying: false, amount: 0 };
        // } else {
        //     return { isPaying: true, amount: parseInt(service.tariff, 10) };
        // }

        return { isPaying: false, amount: 0 };
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
        appointment.status = 'Cancelled';
        await appointment.save();
        // remove from queue
        await this.queueSystemRepository.delete({ appointment });
        return await appointment.softRemove();
    }

    async acceptAppointment({ appointmentId, action, doctor_id, consulting_room_id }, username: string) {
        try {
            const doctor = await getRepository(StaffDetails).findOne(doctor_id);

            const appointment = await this.getAppointment(appointmentId);

            if (doctor) {
                appointment.whomToSee = doctor;
            }

            try {
                if (consulting_room_id) {
                    const room = await this.consultingRoomRepository.findOne(consulting_room_id);
                    appointment.consultingRoom = room;

                    if (process.env.DEBUG === 'true') {
                        const text = `Patient ${appointment.patient.id}, please proceed to consulting ${room.name}`;
                        say.speak(text, null, 1.0, (err) => {
                            if (err) {
                                return console.error(err);
                            }

                            say.stop();
                        });
                    }
                }
            } catch (e) {
                console.log(e);
            }

            appointment.doctorStatus = action;
            appointment.lastChangedBy = username;
            await appointment.save();

            this.appGateway.server.emit('appointment-update', { appointment, action });
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async repeatPrompt(appointmentId: number) {
        try {
            const appointment = await this.getAppointment(appointmentId);

            if (process.env.DEBUG === 'true') {
                const text = `Patient ${appointment.patient.id}, please proceed to consulting ${appointment.consultingRoom.name}`;
                say.speak(text, null, 1.0, (err) => {
                    if (err) {
                        return console.error(err);
                    }

                    say.stop();
                });
            }

            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    private async saveTransaction(patient: Patient, hmo, service: Service, serviceCost: ServiceCost, paymentType, createdBy, appointment) {
        const amount = serviceCost.tariff;

        const data = {
            patient,
            amount,
            description: service.name,
            payment_type: (hmo.name !== 'Private') ? 'HMO' : 'self',
            bill_source: service.category.name,
            service: serviceCost,
            createdBy,
            hmo,
            next_location: 'vitals',
            appointment,
            transaction_type: 'debit',
            balance: amount * -1,
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
            .andWhere('appointment.service_cost_id = :service_id', { service_id })
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
            .andWhere('appointment.service_cost_id = :service_id', { service_id })
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
