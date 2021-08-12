import { EntityRepository, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientDto } from '../dto/patient.dto';
import { PatientNOK } from '../entities/patient-next-of-kin.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';
import * as moment from 'moment';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {

    async savePatient(patientDto: PatientDto, nextOfkin: PatientNOK, hmo: HmoScheme, createdBy, pic) {

        const patient = new Patient();
        patient.legacy_patient_id     = patientDto.legacyId;
        patient.surname             = patientDto.surname.toLocaleLowerCase();
        patient.other_names         = patientDto.other_names.toLocaleLowerCase();
        patient.address             = patientDto.address.toLocaleLowerCase();
        patient.date_of_birth       = moment(patientDto.date_of_birth).format('YYYY-MM-DD');
        patient.occupation          = patientDto.occupation;
        patient.gender              = patientDto.gender;
        patient.email               = patientDto.email;
        patient.phone_number         = patientDto.phoneNumber;
        patient.maritalStatus       = patientDto.maritalStatus;
        patient.ethnicity           = patientDto.ethnicity || '';
        patient.referredBy          = patientDto.referredBy;
        patient.createdBy           = createdBy;
        patient.nextOfKin           = nextOfkin;
        patient.profile_pic         = (pic) ? pic.filename : '';
        patient.hmo                 = hmo;
        return await patient.save();
    }
}
