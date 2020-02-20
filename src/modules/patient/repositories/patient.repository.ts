import { EntityRepository, Repository } from 'typeorm';
import { Patient } from '../patient.entity';
import { PatientDto } from '../dto/patient.dto';
import { PatientNOK } from '../patient-next-of-kin.entity';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {

    async savePatient(patientDto: PatientDto, nextOfkin: PatientNOK) {
        const patient = new Patient();
        patient.surname             = patientDto.surname;
        patient.other_names         = patientDto.other_names;
        patient.address             = patientDto.address;
        patient.date_of_birth       = patientDto.date_of_birth;
        patient.occupation          = patientDto.occupation;
        patient.gender              = patientDto.gender;
        patient.email               = patientDto.email;
        patient.phoneNumber         = patientDto.phoneNumber;
        patient.maritalStatus       = patientDto.maritalStatus;
        patient.ethnicity           = patientDto.ethnicity;
        patient.referredBy          = patientDto.referredBy;
        patient.insurranceStatus    = patientDto.insurranceStatus;
        patient.nextOfKin           = nextOfkin;
        await patient.save();

        return patient;
    }
}
