import { EntityRepository, Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentDto } from './dto/appointment.dto';
import { Patient } from '../../patient/patient.entity';
import { Specialization } from '../../settings/entities/specialization.entity';
import { Department } from '../../settings/entities/department.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {

    async saveAppointment(
        appointmentDto: AppointmentDto,
        patient: Patient,
        specialization: Specialization,
        department: Department,
        consultingRoom: ConsultingRoom,
    ) {
        const { } = appointmentDto;
        const appointment = new Appointment();
        appointment.patient = patient;
        appointment.department = department;
        appointment.specialization = specialization;
        appointment.consultingRoom = consultingRoom;
        appointment.appointment_date = appointmentDto.appointment_date;
        appointment.appointment_type = appointmentDto.appointment_type;
        appointment.duration = appointmentDto.duration;
        appointment.refferedBy = appointmentDto.refferedBy;
        appointment.referralCompany = appointmentDto.referralCompany;
        await appointment.save();

        return appointment;
    }
}
