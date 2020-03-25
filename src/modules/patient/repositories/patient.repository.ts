import { EntityRepository, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientDto } from '../dto/patient.dto';
import { PatientNOK } from '../entities/patient-next-of-kin.entity';
import { Hmo } from '../../hmo/hmo.entity';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {

    async savePatient(patientDto: PatientDto, nextOfkin: PatientNOK, hmo: Hmo) {
        const patient = new Patient();
        patient.fileNumber          =  'DEDA-' + Math.floor(Math.random() * 90000),
        patient.surname             = patientDto.surname.toLocaleLowerCase();
        patient.other_names         = patientDto.other_names.toLocaleLowerCase();
        patient.address             = patientDto.address.toLocaleLowerCase();
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
        if (hmo) {
            patient.hmo = hmo;
        }
        await patient.save();

        return patient;
    }
}
