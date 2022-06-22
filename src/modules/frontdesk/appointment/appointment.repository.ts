import { EntityRepository, Repository } from 'typeorm';

import { Appointment } from './appointment.entity';
import { AppointmentDto } from './dto/appointment.dto';
import { Patient } from '../../patient/entities/patient.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { Department } from '../../settings/entities/department.entity';
import { ServiceCost } from '../../settings/entities/service_cost.entity';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
  async saveAppointment(
    appointmentDto: AppointmentDto,
    patient: Patient,
    consultingRoom: ConsultingRoom,
    doctor: StaffDetails,
    service,
    serviceCost: ServiceCost,
    department: Department,
    username: string,
  ) {
    const appointment = new Appointment();
    appointment.patient = patient;
    appointment.whomToSee = doctor;
    appointment.consultingRoom = consultingRoom;
    appointment.appointment_date = appointmentDto.appointment_date;
    appointment.serviceCategory = service.category;
    appointment.service = serviceCost;
    appointment.description = appointmentDto.description;
    appointment.referredBy = appointmentDto.referredBy;
    appointment.referralCompany = appointmentDto.referralCompany;
    appointment.department = department;
    appointment.createdBy = username;
    await appointment.save();

    return appointment;
  }
}
