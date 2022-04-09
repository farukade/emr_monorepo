import moment = require("moment");
import { StaffDetails } from "src/modules/hr/staff/entities/staff_details.entity";
import { Patient } from "src/modules/patient/entities/patient.entity";
import { Department } from "src/modules/settings/entities/department.entity";
import { EntityRepository, Repository } from "typeorm";
import { doctorsAppointmentDto } from "./dto/appointment.dto";
import { DoctorsAppointment } from "./appointment.entity";

@EntityRepository(DoctorsAppointment)
export class DoctorsAppointmentRepository extends Repository<DoctorsAppointment> {
    async saveProposedAppointment (
        data: doctorsAppointmentDto,
        patient: Patient,
        doctor: StaffDetails,
        department: Department,
        ) {

        const proposedAppointmentDateTime = `${moment(data.appointment_date).format('YYYY-MM-DD')} ${data.appointment_time}`;
        const proposedAppointmentDate = moment(data.appointment_date).format('YYYY-MM-DD');
        const proposedAppointmentTime = data.appointment_time

        const proposedAppointment = new DoctorsAppointment();
        proposedAppointment.appointment_date_time = proposedAppointmentDateTime;
        proposedAppointment.appointment_time = proposedAppointmentDate;
        proposedAppointment.appointment_date = proposedAppointmentTime;
        proposedAppointment.patient = patient; 
        proposedAppointment.whomToSee = doctor;
        proposedAppointment.department = department;
        proposedAppointment.isOnline = data.isOnline;
            
        await proposedAppointment.save();

        return proposedAppointment;
    }
}