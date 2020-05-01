import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffRepository } from './staff.repository';
import { StaffDto } from './dto/staff.dto';
import { StaffDetails } from './entities/staff_details.entity';
import { UserRepository } from '../user.repository';
import { RoleRepository } from '../../settings/roles-permissions/role.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import * as bcrypt from 'bcrypt';
import { Like } from 'typeorm';

@Injectable()
export class StaffService {

    constructor(
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(RoleRepository)
        private roleRepository: RoleRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
    ) {}

    async getStaffs(): Promise<StaffDetails[]> {
        const staffs = await this.staffRepository.find({relations: ['department', 'user']});
        return staffs;
    }

    async findStaffs(param): Promise<StaffDetails[]> {
        const { q } = param;
        const found = this.staffRepository.find({where: [
            {first_name: Like(`%${q.toLocaleLowerCase()}%`)},
            {last_name: Like(`%${q.toLocaleLowerCase()}%`)},
            {emp_code: Like(`%${q}%`)},
        ]});

        return found;
    }

    async addNewStaff(staffDto: StaffDto): Promise<StaffDetails> {
        // find role
        const role = await this.roleRepository.findOne(staffDto.role_id);
        // find department
        const department = await this.departmentRepository.findOne(staffDto.department_id);
        // save user
        const user = await this.userRepository.save({
            username: staffDto.username.toLocaleLowerCase(),
            password: await this.getHash(staffDto.password),
            role,
        });

        // save staff
        const staff = await this.staffRepository.saveDetails(staffDto, department, user);

        return staff;
    }

    async updateStaffDetails(id: string, staffDto: StaffDto): Promise<StaffDetails> {
        // find role
        const role = await this.roleRepository.findOne(staffDto.role_id);
        // find department
        const department = await this.departmentRepository.findOne(staffDto.department_id);

        // find staff
        const staff = await this.staffRepository.findOne(id);
        staff.first_name     = staffDto.first_name.toLocaleLowerCase();
        staff.last_name      = staffDto.last_name.toLocaleLowerCase();
        staff.other_names    = staffDto.other_names.toLocaleLowerCase();
        staff.address        = staffDto.address;
        staff.phone_number   = staffDto.phone_number;
        staff.email          = staffDto.email;
        staff.nationality    = staffDto.nationality;
        staff.state_of_origin= staffDto.state_of_origin;
        staff.lga            = staffDto.lga;
        staff.bank_name      = staffDto.bank_name;
        staff.account_number = staffDto.account_number;
        staff.pension_mngr   = staffDto.pension_mngr;
        staff.gender         = staffDto.gender;
        staff.marital_status = staffDto.marital_status;
        staff.number_of_children = staffDto.number_of_children;
        staff.religion       = staffDto.religion;
        staff.date_of_birth  = staffDto.date_of_birth;
        staff.next_of_kin    = staffDto.next_of_kin;
        staff.next_of_kin_dob = staffDto.next_of_kin_dob;
        staff.next_of_kin_address = staffDto.next_of_kin_address;
        staff.next_of_kin_relationship = staffDto.next_of_kin_relationship;
        staff.next_of_kin_contact_no = staffDto.next_of_kin_contact_no;
        staff.job_title = staffDto.job_title;
        staff.contract_type = staffDto.contract_type;
        staff.employment_start_date = staffDto.employment_start_date;
        staff.annual_salary = staffDto.annual_salary;
        staff.monthly_salary = staffDto.monthly_salary;
        staff.is_consultant = staffDto.is_consultant;
        staff.emp_code = 'DEDA-' + Math.floor(Math.random() * 4),
        
        await staff.save();

        return staff;
    }

    async deleteStaff(id: string) {
        const result = await this.staffRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Staff with ID '${id}' not found`);
        }
    }

    async changePassword() {}

    async changeUserName() {}

    async getHash(password: string | undefined): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}
