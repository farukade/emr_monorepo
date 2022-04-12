import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRepository } from 'src/modules/hr/staff/staff.repository';
import { PatientRepository } from 'src/modules/patient/repositories/patient.repository';
import { DepartmentRepository } from 'src/modules/settings/departments/department.repository';
import { DoctorsAppointmentController } from './appointment.controller';
import { DoctorsAppointmentRepository } from './appointment.repository';
import { DoctorsAppointmentService } from './appointment.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			DoctorsAppointmentRepository,
			PatientRepository,
			DepartmentRepository,
			StaffRepository,
		]),
	],
	controllers: [DoctorsAppointmentController],
	providers: [DoctorsAppointmentService],
})
export class DoctorsAppointmentModule {}
