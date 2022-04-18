import { Module } from '@nestjs/common';
import { AntenatalService } from './antenatal.service';
import { AntenatalController } from './antenatal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntenatalEnrollmentRepository } from './enrollment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AntenatalAssessmentRepository } from './antenatal-assessment.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { AntenatalPackageRepository } from '../../settings/antenatal-packages/antenatal-package.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			AntenatalAssessmentRepository,
			AntenatalEnrollmentRepository,
			PatientRepository,
			PatientRequestRepository,
			AntenatalPackageRepository,
			AdmissionsRepository,
			TransactionsRepository,
			PatientNoteRepository,
			AppointmentRepository,
			PatientVitalRepository,
			StaffRepository,
			DepartmentRepository,
		]),
	],
	providers: [AntenatalService],
	controllers: [AntenatalController],
})
export class AntenatalModule {}
