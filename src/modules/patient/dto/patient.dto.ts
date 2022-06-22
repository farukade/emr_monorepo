import { IsNotEmpty, IsEmail } from 'class-validator';

export class PatientDto {
  address: string;

  @IsNotEmpty()
  date_of_birth: string;

  email: string;

  ethnicity: string;

  gender: string;

  @IsNotEmpty()
  hmo_id: number;

  maritalStatus: string;

  surname: string;

  avatar: string;

  staff_id: any;

  nok_address: string;

  nok_date_of_birth: string;

  nok_email: string;

  nok_ethnicity: string;

  nok_gender: string;

  nok_maritalStatus: string;

  nok_occupation: string;

  nok_other_names: string;

  nok_phoneNumber: string;

  nok_relationship: string;

  nok_surname: string;

  occupation: string;

  other_names: string;

  phone_number: string;

  referredBy: string;

  enrollee_id: string;
}
