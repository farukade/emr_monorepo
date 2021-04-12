import { EntityRepository, Repository } from 'typeorm';
import * as moment from 'moment';

import { Appointment } from './appointment.entity';
import { AppointmentDto } from './dto/appointment.dto';
import { Patient } from '../../patient/entities/patient.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';
import { Service } from '../../settings/entities/service.entity';
import {StaffDetails} from '../../hr/staff/entities/staff_details.entity';
import { Department } from '../../settings/entities/department.entity';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {

    async saveAppointment(
        appointmentDto: AppointmentDto,
        patient: Patient,
        consultingRoom: ConsultingRoom,
        doctor: StaffDetails,
        amount,
        service: Service,
        department: Department,
    ) {
        const appointmentDate = `${moment(appointmentDto.appointment_date).format('YYYY-MM-DD')} ${moment().format('HH:mm:ss')}`;
        const appointment = new Appointment();
        appointment.patient = patient;
        appointment.whomToSee = doctor;
        appointment.consultingRoom = consultingRoom;
        appointment.appointment_date = appointmentDate;
        appointment.serviceCategory = service.category;
        appointment.serviceType = service;
        appointment.amountToPay = amount;
        appointment.duration = appointmentDto.duration;
        appointment.description = appointmentDto.description;
        appointment.referredBy = appointmentDto.referredBy;
        appointment.referralCompany = appointmentDto.referralCompany;
        appointment.department = department;
        await appointment.save();

        return appointment;
    }

    async saveOPDAppointment(patient, opdType) {
        const appointment = new Appointment();
        appointment.patient = patient;
        appointment.amountToPay = '0';
        appointment.appointment_date = moment().format('YYYY-MM-DD HH:mm:ss');
        appointment.appointmentType = opdType;
        await appointment.save();

        return appointment;
    }
}
