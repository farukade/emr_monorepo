import { IsNotEmpty, IsEmail } from 'class-validator';
import { Patient } from '../entities/patient.entity';

export class PatientAntenatalDto {
	@IsNotEmpty()
	heightOfFunds: string;

	@IsNotEmpty()
	fetalHeartRate: string;

	@IsNotEmpty()
	patient_id: string;

	positionOfFetus: string;

	fetalLie: string;

	relationshipToBrim: string;

	patient: Patient;
}
