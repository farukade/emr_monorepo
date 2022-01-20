import { EntityRepository, Repository } from 'typeorm';
import { StaffDetails } from './entities/staff_details.entity';
import { Department } from '../../settings/entities/department.entity';
import { User } from '../../auth/entities/user.entity';
// @ts-ignore
import * as startCase from 'lodash.startcase';
import { StaffDto } from './dto/staff.dto';

@EntityRepository(StaffDetails)
export class StaffRepository extends Repository<StaffDetails> {

    async saveDetails(staffDto: StaffDto, department: Department, user: User, specialization, username: string) {
        try {
            const staff = new StaffDetails();
            staff.first_name = startCase(staffDto?.first_name?.toLocaleLowerCase());
            staff.last_name = startCase(staffDto?.last_name?.toLocaleLowerCase());
            staff.other_names = startCase(staffDto?.other_names?.toLocaleLowerCase());
            staff.profile_pic = staffDto.profile_pic;
            staff.address = staffDto.address;
            staff.phone_number = staffDto.phone_number;
            staff.email = staffDto.email;
            staff.nationality = staffDto.nationality;
            staff.state_of_origin = staffDto.state_of_origin;
            staff.lga = staffDto.lga;
            staff.bank_name = staffDto.bank_name;
            staff.account_number = staffDto.account_number;
            staff.pension_mngr = staffDto.pension_mngr;
            staff.gender = staffDto.gender;
            staff.marital_status = staffDto.marital_status;
            staff.number_of_children = staffDto.number_of_children;
            staff.religion = staffDto.religion;
            staff.date_of_birth = staffDto.date_of_birth;
            staff.next_of_kin = staffDto.next_of_kin;
            staff.next_of_kin_dob = staffDto.next_of_kin_dob;
            staff.next_of_kin_address = staffDto.next_of_kin_address;
            staff.next_of_kin_relationship = staffDto.next_of_kin_relationship;
            staff.next_of_kin_contact_no = staffDto.next_of_kin_contact_no;
            staff.job_title = staffDto.job_title;
            staff.contract_type = staffDto.contract_type;
            staff.employment_start_date = staffDto.employment_start_date;
            staff.annual_salary = staffDto.annual_salary;
            staff.monthly_salary = staffDto.monthly_salary;
            staff.department = department;
            staff.is_consultant = staffDto.is_consultant;
            staff.specialization = specialization;
            staff.user = user;
            staff.employee_number = staffDto.employee_number;
            staff.createdBy = username;
            staff.profession = staffDto.profession;
            staff.createdBy = username;

            const rs = await staff.save();
            console.log(rs);

            return { success: true, staff: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error, could not create staff' };
        }
    }

}
