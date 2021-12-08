import { EntityRepository, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientDto } from '../dto/patient.dto';
import { PatientNOK } from '../entities/patient-next-of-kin.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';
// @ts-ignore
import * as startCase from 'lodash.startcase';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {

    async savePatient(patientDto: PatientDto, nextOfkin: PatientNOK, hmo: HmoScheme, createdBy, staff) {
        const patient = new Patient();
        patient.surname = startCase(patientDto.surname.toLocaleLowerCase());
        patient.other_names = startCase(patientDto.other_names.toLocaleLowerCase());
        patient.address = startCase(patientDto.address.toLocaleLowerCase());
        patient.date_of_birth = patientDto.date_of_birth;
        patient.occupation = patientDto.occupation;
        patient.gender = patientDto.gender;
        patient.email = patientDto.email.toLocaleLowerCase();
        patient.phone_number = patientDto.phone_number;
        patient.maritalStatus = patientDto.maritalStatus;
        patient.ethnicity = patientDto.ethnicity || '';
        patient.referredBy = patientDto.referredBy || '';
        patient.createdBy = createdBy;
        patient.nextOfKin = nextOfkin;
        patient.profile_pic = patientDto.avatar || '';
        patient.hmo = hmo;

        if (staff) {
            patient.staff = staff;
        }

        return await patient.save();
    }
}
