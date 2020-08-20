import { EntityRepository, Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentDto } from './dto/appointment.dto';
import { Patient } from '../../patient/entities/patient.entity';
import { Specialization } from '../../settings/entities/specialization.entity';
import { Department } from '../../settings/entities/department.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';
import * as moment from 'moment';
import { Service } from '../../settings/entities/service.entity';
import { ServiceCategory } from '../../settings/entities/service_category.entity';
import {StaffDetails} from "../../hr/staff/entities/staff_details.entity";

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {

    async  saveAppointment(
        appointmentDto: AppointmentDto,
        patient: Patient,
        consultingRoom: ConsultingRoom,
        doctor: StaffDetails,
        amount,
        service: Service,
        category: ServiceCategory,
    ) {
        const appointment_date = moment(appointmentDto.appointment_date).format('YYYY-MM-DD');
        const appointment = new Appointment();
        appointment.patient = patient;
        appointment.whomToSee = doctor;
        appointment.consultingRoom = consultingRoom;
        appointment.appointment_date = appointment_date;
        appointment.serviceCategory = category;
        appointment.serviceType = service;
        appointment.amountToPay = amount;
        appointment.duration = appointmentDto.duration;
        appointment.description = appointmentDto.description;
        appointment.referredBy = appointmentDto.referredBy;
        appointment.referralCompany = appointmentDto.referralCompany;
        await appointment.save();

        return appointment;
    }

    async saveOPDAppointment(patient, opdType) {
        const appointment = new Appointment();
        appointment.patient = patient;
        appointment.amountToPay = '0';
        appointment.appointment_date = moment().format('YYYY-MM-DD');
        appointment.appointmentType = opdType;
        await appointment.save();

        return appointment;
    }
}
