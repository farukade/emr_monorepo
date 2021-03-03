import { EntityRepository, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientDto } from '../dto/patient.dto';
import { PatientNOK } from '../entities/patient-next-of-kin.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {

    async savePatient(patientDto: PatientDto, nextOfkin: PatientNOK, hmo: Hmo, createdBy, pic) {
        
        const patient = new Patient();
        patient.fileNumber          =  'DH' + Math.floor(Math.random() * 90000),
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
        patient.createdBy           = createdBy;
        patient.nextOfKin           = nextOfkin;
        patient.profile_pic = (pic) ? pic.filename : '';
        patient.hmo                 = hmo;
        const rs = await patient.save();
        console.log(rs);

        return rs;
    }
}
