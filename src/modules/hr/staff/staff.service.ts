import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffRepository } from './staff.repository';
import { StaffDto } from './dto/staff.dto';
import { StaffDetails } from './entities/staff_details.entity';
import { RoleRepository } from '../../settings/roles-permissions/role.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import * as bcrypt from 'bcrypt';
import { Brackets, getRepository, Like, Raw } from 'typeorm';
import { Specialization } from '../../settings/entities/specialization.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { AuthRepository } from '../../auth/auth.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import * as moment from 'moment';
import { SpecializationRepository } from '../../settings/specialization/specialization.repository';
import { PatientRepository } from '../../patient/repositories/patient.repository';
// @ts-ignore
import * as startCase from 'lodash.startcase';

@Injectable()
export class StaffService {
	constructor(
		@InjectRepository(StaffRepository)
		private staffRepository: StaffRepository,
		@InjectRepository(AuthRepository)
		private authRepository: AuthRepository,
		@InjectRepository(RoleRepository)
		private roleRepository: RoleRepository,
		@InjectRepository(DepartmentRepository)
		private departmentRepository: DepartmentRepository,
		@InjectRepository(AppointmentRepository)
		private appointmentRepository: AppointmentRepository,
		@InjectRepository(SpecializationRepository)
		private specializationRepository: SpecializationRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
	) {
	}

	async getStaffs(options: PaginationOptionsInterface, params): Promise<Pagination> {
		const { q, status } = params;
		const query = this.staffRepository.createQueryBuilder('s').select('s.*');

		const page = options.page - 1;

		if (q && q !== '') {
			query.andWhere(new Brackets(qb => {
				qb.where('LOWER(s.first_name) Like :first_name', { first_name: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(s.last_name) Like :last_name', { last_name: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(s.employee_number) Like :employee_number', { employee_number: `%${q.toLowerCase()}%` })
					.orWhere('s.phone_number Like :phone_number', { phone_number: `%${q}%` })
					.orWhere('CAST(s.id AS text) LIKE :id', { id: `%${q}%` });
			}));
		}

		if (status && status !== '') {
			query.andWhere('s.isActive = :status', { status: status === 'enabled' });
		}

		const staffs = await query.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('s.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		let result = [];
		for (const staff of staffs) {
			if (staff.department_id) {
				staff.department = await this.departmentRepository.findOne(staff.department_id);
			}
			staff.user = await this.authRepository.findOne(staff.user_id, { relations: ['role'] });
			if (staff.specialization_id) {
				staff.specialization = await this.specializationRepository.findOne(staff.specialization_id);
			}

			result = [...result, staff];
		}

		return {
			result,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
	}

	async findStaffs(options, param): Promise<StaffDetails[]> {
		const { q, profession } = param;

		const query = this.staffRepository.createQueryBuilder('s')
			.select('s.*')
			.andWhere(new Brackets(qb => {
				qb.where('LOWER(s.first_name) Like :first_name', { first_name: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(s.last_name) Like :last_name', { last_name: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(s.employee_number) Like :employee_no', { employee_no: `%${q.toLowerCase()}%` })
					.orWhere('s.phone_number Like :phone', { phone: `%${q}%` })
					.orWhere('CAST(s.id AS text) LIKE :id', { id: `%${q}%` });
			}));

		if (profession && profession !== '') {
			query.andWhere('s.profession = :profession', { profession });
		}

		return await query.take(options.limit).getRawMany();
	}

	async addNewStaff(staffDto: StaffDto, createdBy: string): Promise<any> {
		const { role_id, department_id, specialization_id, username } = staffDto;

		// find role
		const role = await this.roleRepository.findOne(role_id);

		// find department
		const department = await this.departmentRepository.findOne(department_id);

		// find specialization
		let specialization;
		if (specialization_id) {
			specialization = await getRepository(Specialization).findOne(specialization_id);
		}

		// save user
		const user = await this.authRepository.save({
			username: username.replace(/\s/g, '').toLocaleLowerCase(),
			password: await this.getHash('password'),
			role,
		});

		// save staff
		return await this.staffRepository.saveDetails(staffDto, department, user, specialization, createdBy);
	}

	async updateStaffDetails(id: string, staffDto: StaffDto, username: string): Promise<any> {
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
			const staff = await this.staffRepository.findOne(id, { relations: ['user', 'user.role'] });
			if (!staff) {
				throw new NotFoundException(`Staff with ID '${id}' not found`);
			}

			// find specialization
			let specialization;
			if (staffDto.specialization_id) {
				specialization = await getRepository(Specialization).findOne(staffDto.specialization_id);
			}

			// update user details
			const user = await this.authRepository.findOne(staff.user.id);
			user.role = role;
			await user.save();

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
			staff.is_consultant = staffDto.is_consultant;
			staff.department = department;
			staff.specialization = specialization;
			staff.profession = staffDto.profession;
			staff.lastChangedBy = username;

			await staff.save();

			return { success: true, staff };
		} catch (err) {
			console.log(err);
			return { success: false, message: err.message };
		}
	}

	async deleteStaff(id: number, username: string) {
		try {
			const staff = await this.staffRepository.findOne(id);
			staff.isActive = false;
			staff.lastChangedBy = username;
			await staff.save();

			return { success: true, result: staff };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async enableStaff(id: number, username: string) {
		try {
			const staff = await this.staffRepository.findOne(id);
			staff.isActive = true;
			staff.lastChangedBy = username;
			const rs = await staff.save();

			return { success: true, result: rs };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async setConsultingRoom({ userId, roomId }) {
		try {
			// find room
			const room = await getRepository(ConsultingRoom).findOne(roomId);

			// update staff detail
			const staff = await this.staffRepository.createQueryBuilder()
				.update(StaffDetails)
				.set({ room })
				.where('id = :id', { id: userId })
				.execute();

			return { success: true, room };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async unSetConsultingRoom(staffId) {
		try {
			const staff = await this.staffRepository.findOne(staffId);
			staff.room = null;
			await staff.save();

			const appointment = await this.appointmentRepository.findOne({
				where: {
					whomToSee: staff,
					appointment_date: Raw(alias => `DATE(${alias}) = '${moment().format('YYYY-MM-DD')}'`),
					doctorStatus: 1,
					status: 'Approved',
				},
			});

			if (appointment) {
				appointment.doctorStatus = 0;
				appointment.whomToSee = null;
				appointment.consultingRoom = null;
				await appointment.save();
			}

			return { success: true };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async getHash(password: string | undefined): Promise<string> {
		return bcrypt.hash(password, 10);
	}
}
