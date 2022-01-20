import { IsNotEmpty } from 'class-validator';

export class StaffDto {
    @IsNotEmpty()
    first_name: string;

    @IsNotEmpty()
    last_name: string;

    other_names: string;

    profile_pic: string;

    address: string;

    phone_number: string;

    nationality: string;

    state_of_origin: string;

    lga: string;

    avatar: string;

    bank_name: string;

    account_number: string;

    pension_mngr: string;

    gender: string;

    marital_status: string;

    number_of_children: string;

    religion: string;

    date_of_birth: string;

    next_of_kin: string;

    next_of_kin_dob: string;

    next_of_kin_address: string;

    next_of_kin_relationship: string;

    next_of_kin_contact_no: string;

    job_title: string;

    contract_type: string;

    employment_start_date: string;

    department_id: string;

    role_id: string;

    username: string;

    employee_number: string;

    email: string;

    annual_salary: string;

    monthly_salary: string;

    is_consultant: boolean;

    specialization_id: string;

    profession: string;
}
