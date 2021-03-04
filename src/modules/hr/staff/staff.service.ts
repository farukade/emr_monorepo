import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffRepository } from './staff.repository';
import { StaffDto } from './dto/staff.dto';
import { StaffDetails } from './entities/staff_details.entity';
import { UserRepository } from '../user.repository';
import { RoleRepository } from '../../settings/roles-permissions/role.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import * as bcrypt from 'bcrypt';
import {getRepository, Like} from 'typeorm';
import {Specialization} from '../../settings/entities/specialization.entity';
import {ConsultingRoom} from '../../settings/entities/consulting-room.entity';

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
        const staffs = await this.staffRepository.find({
            where: {
                isActive: true,
            },
            relations: ['department', 'user', 'user.role', 'specialization']});
        for (const staff of staffs) {
            if (staff.profile_pic) {
                staff.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${staff.profile_pic}`;
            }
        }
        return staffs;
    }

    async getAllStaffs(): Promise<StaffDetails[]> {
        const staffs = await this.staffRepository.find({relations: ['department', 'user', 'user.role', 'specialization']});
        for (const staff of staffs) {
            if (staff.profile_pic) {
                staff.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${staff.profile_pic}`;
            }
        }
        return staffs;
    }

    async findStaffs(param): Promise<StaffDetails[]> {
        const { q } = param;
        return this.staffRepository.find({where: [
            {first_name: Like(`%${q.toLocaleLowerCase()}%`)},
            {last_name: Like(`%${q.toLocaleLowerCase()}%`)},
            {emp_code: Like(`%${q}%`)},
        ]});
    }

    async addNewStaff(staffDto: StaffDto, pic): Promise<any> {
        console.log(pic);
        console.log(staffDto);
        // find role
        const role = await this.roleRepository.findOne(staffDto.role_id);
        // find department
        const department = await this.departmentRepository.findOne(staffDto.department_id);
        // find specialization
        let specialization;
        if (staffDto.specialization_id) {
            specialization = await getRepository(Specialization).findOne(staffDto.specialization_id);
        }
        // save user
        const user = await this.userRepository.save({
            username: staffDto.username.toLocaleLowerCase(),
            password: await this.getHash(staffDto.password),
            role,
        });

        // save staff
        return await this.staffRepository.saveDetails(staffDto, department, user, specialization, pic);
    }

    async updateStaffDetails(id: string, staffDto: StaffDto, pic): Promise<any> {
        try {
            // find role
            const role = await this.roleRepository.findOne(staffDto.role_id);
            if (!role) {
                throw new NotFoundException(`Role not found`);
            }
            // find department
            const department = await this.departmentRepository.findOne(staffDto.department_id);
            if (!department) {
                throw new NotFoundException(`Department not found`);
            }
            // find staff
            const staff = await this.staffRepository.findOne(id, {relations: ['user', 'user.role']});
            if (!staff) {
                throw new NotFoundException(`Staff with ID '${id}' not found`);
            }

            // find specialization
            let specialization;
            if (staffDto.specialization_id) {
                specialization = await getRepository(Specialization).findOne(staffDto.specialization_id);
            }
            // update user details
            const user = await this.userRepository.findOne(staff.user.id);
            user.role = role;
            user.username = staffDto.username;
            if (staffDto.password) {
                user.password = await this.getHash(staffDto.password);
            }
            user.save();

            staff.first_name     = staffDto.first_name.toLocaleLowerCase();
            staff.last_name      = staffDto.last_name.toLocaleLowerCase();
            staff.other_names    = staffDto.other_names.toLocaleLowerCase();
            staff.address        = staffDto.address;
            staff.phone_number   = staffDto.phone_number;
            staff.email          = staffDto.email;
            staff.nationality    = staffDto.nationality;
            staff.state_of_origin = staffDto.state_of_origin;
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
            staff.department = department;
            staff.specialization = specialization;
            if (pic) {
                staff.profile_pic = pic.filename;
            }
            await staff.save();

            if (staff && staff.profile_pic) {
                staff.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${staff.profile_pic}`;
              }

            return {success: true, staff};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async deleteStaff(id: number) {
        try{
            const result = await this.staffRepository.findOne(id);
            result.isActive = false;
            await result.save();
            return {success: true, result};
        }
        catch(e){
            return {success: false, message:e.message };
        } 
    }

    async enableStaff(id: number) {
        try{
            const result = await this.staffRepository.findOne(id);
            result.isActive = true;
            await result.save();
            return {success: true, result};
        }
        catch(e){
            return {success: false, message:e.message};
        }
    }

    async setConsultingRoom({userId, roomId}) {
        try {
            // find room
            const room = await getRepository(ConsultingRoom).findOne(roomId);
            // update staff detail
            await this.staffRepository.createQueryBuilder()
                .update(StaffDetails)
                .set({ room })
                .where('id = :id', { id: userId })
                .execute();
            return {success: true};
        } catch (e) {
            return {success: false, message: e.message};
        }
    }

    async unSetConsultingRoom(staffId) {
        try {
            const staff = await this.staffRepository.findOne(staffId);
            staff.room = null;
            await staff.save();
            return {success: true};
        } catch (e) {
            return {success: false, message: e.message};
        }
    }

    async getHash(password: string | undefined): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}
