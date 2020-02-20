import { EntityRepository, Repository } from 'typeorm';
import { PatientNOK } from '../patient-next-of-kin.entity';
import { PatientDto } from '../dto/patient.dto';

@EntityRepository(PatientNOK)
export class PatientNOKRepository extends Repository<PatientNOK> {

    async saveNOK(patientDto: PatientDto) {
        const nok = new PatientNOK();
        nok.surname             = patientDto.nok_surname;
        nok.other_names         = patientDto.nok_other_names;
        nok.address             = patientDto.nok_address;
        nok.date_of_birth       = patientDto.nok_date_of_birth;
        nok.occupation          = patientDto.nok_occupation;
        nok.gender              = patientDto.nok_gender;
        nok.email               = patientDto.nok_email;
        nok.phoneNumber         = patientDto.nok_phoneNumber;
        nok.maritalStatus       = patientDto.nok_maritalStatus;
        nok.ethnicity           = patientDto.nok_ethnicity;
        await nok.save();

        return nok;
    }
}
