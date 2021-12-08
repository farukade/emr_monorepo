import { EntityRepository, Repository } from 'typeorm';
import { StaffDetails } from './entities/staff_details.entity';
import { Department } from '../../settings/entities/department.entity';
import { User } from '../../auth/entities/user.entity';
// @ts-ignore
import * as startCase from 'lodash.startcase';

@EntityRepository(StaffDetails)
export class StaffRepository extends Repository<StaffDetails> {

     serializeData = (item) => {
        try {
            return Object.values(item)[1];
        } catch (e) {
            return item;
        }
    }

    async saveDetails(staffDto: any, department: Department, user: User, specialization, pic, username) {
        try {
            const staff = new StaffDetails();
            staff.first_name = startCase(staffDto?.first_name?.toLocaleLowerCase());
            staff.last_name = startCase(staffDto?.last_name?.toLocaleLowerCase());
            staff.other_names = startCase(staffDto?.other_names?.toLocaleLowerCase());
            staff.address = staffDto.address;
            staff.phone_number = staffDto.phone_number;
            staff.email = staffDto.email;
            staff.nationality = staffDto.nationality;
            staff.state_of_origin = staffDto.state_of_origin;
            staff.lga = staffDto.lga;
            staff.bank_name = this.serializeData(staffDto.bank_name);
            staff.account_number = this.serializeData(staffDto.account_number);
            staff.pension_mngr = this.serializeData(staffDto.pension_mngr);
            staff.gender = staffDto.gender;
            staff.marital_status = this.serializeData(staffDto.marital_status);
            staff.number_of_children = this.serializeData(staffDto.number_of_children);
            staff.religion = staffDto.religion;
            staff.date_of_birth = staffDto.date_of_birth;
            staff.next_of_kin = this.serializeData(staffDto.next_of_kin);
            staff.next_of_kin_dob = this.serializeData(staffDto.next_of_kin_dob);
            staff.next_of_kin_address = this.serializeData(staffDto.next_of_kin_address);
            staff.next_of_kin_relationship = this.serializeData(staffDto.next_of_kin_relationship);
            staff.next_of_kin_contact_no = this.serializeData(staffDto.next_of_kin_contact_no);
            staff.job_title = this.serializeData(staffDto.job_title);
            staff.contract_type = this.serializeData(staffDto.contract_type);
            staff.employment_start_date = this.serializeData(staffDto.employment_start_date);
            staff.annual_salary = this.serializeData(staffDto.annual_salary);
            staff.monthly_salary = this.serializeData(staffDto.monthly_salary);
            staff.department = department;
            staff.is_consultant = staffDto.is_consultant;
            staff.profile_pic = (pic) ? pic.filename : '';
            staff.specialization = specialization;
            staff.user = user;
            staff.employee_number = staffDto.employee_number;
            staff.createdBy = username;
            staff.profession = staffDto.profession;

            const rs = await staff.save();
            console.log(rs);

            return { success: true, staff: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error, could not create staff' };
        }
    }

}
