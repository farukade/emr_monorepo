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
			staff.department = await this.departmentRepository.findOne(staff.department_id);
			staff.user = await this.authRepository.findOne(staff.user_id, { relations: ['role'] });
			staff.specialization = await this.specializationRepository.findOne(staff.specialization_id);

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

	async findStaffs(param): Promise<StaffDetails[]> {
		const { q, profession } = param;

		const query = await this.staffRepository.createQueryBuilder('s')
			.select('s.*')
			.andWhere(new Brackets(qb => {
				qb.where('LOWER(s.first_name) Like :first_name', { first_name: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(s.last_name) Like :last_name', { last_name: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(s.employee_number) Like :employee_number', { employee_number: `%${q.toLowerCase()}%` })
					.orWhere('s.phone_number Like :phone_number', { phone_number: `%${q}%` })
					.orWhere('CAST(s.id AS text) LIKE :id', { id: `%${q}%` });
			}));

		if (profession !== '') {
			query.andWhere('s.profession = :profession', { profession });
		}

		return await query.take(20).getRawMany();
	}

	async addNewStaff(staffDto: StaffDto, pic, username): Promise<any> {
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
		const user = await this.authRepository.save({
			username: staffDto.username.toLocaleLowerCase(),
			password: await this.getHash('password'),
			role,
		});

		// save staff
		return await this.staffRepository.saveDetails(staffDto, department, user, specialization, pic, username);
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

			function serializeData(item) {
				try {
					return Object.values(item)[1];
				} catch (e) {
					return item;
				}
			}

			staff.first_name = staffDto.first_name.toLocaleLowerCase();
			staff.last_name = staffDto.last_name.toLocaleLowerCase();
			staff.other_names = staffDto.other_names.toLocaleLowerCase();
			staff.address = staffDto.address;
			staff.phone_number = staffDto.phone_number;
			staff.email = staffDto.email;
			staff.nationality = staffDto.nationality;
			staff.state_of_origin = staffDto.state_of_origin;
			staff.lga = staffDto.lga;
			staff.bank_name = serializeData(staffDto.bank_name);
			staff.account_number = serializeData(staffDto.account_number);
			staff.pension_mngr = serializeData(staffDto.pension_mngr);
			staff.gender = staffDto.gender;
			staff.marital_status = serializeData(staffDto.marital_status);
			staff.number_of_children = serializeData(staffDto.number_of_children);
			staff.religion = staffDto.religion;
			staff.date_of_birth = staffDto.date_of_birth;
			staff.next_of_kin = serializeData(staffDto.next_of_kin);
			staff.next_of_kin_dob = serializeData(staffDto.next_of_kin_dob);
			staff.next_of_kin_address = serializeData(staffDto.next_of_kin_address);
			staff.next_of_kin_relationship = serializeData(staffDto.next_of_kin_relationship);
			staff.next_of_kin_contact_no = serializeData(staffDto.next_of_kin_contact_no);
			staff.job_title = serializeData(staffDto.job_title);
			staff.contract_type = serializeData(staffDto.contract_type);
			staff.employment_start_date = serializeData(staffDto.employment_start_date);
			staff.annual_salary = serializeData(staffDto.annual_salary);
			staff.monthly_salary = serializeData(staffDto.monthly_salary);
			staff.is_consultant = staffDto.is_consultant;
			staff.department = department;
			staff.specialization = specialization;
			staff.profession = staffDto.profession;
			if (pic) {
				staff.profile_pic = pic.filename;
			}
			await staff.save();

			return { success: true, staff };
		} catch (err) {
			console.log(err);
			return { success: false, message: err.message };
		}
	}

	async deleteStaff(id: number) {
		try {
			const result = await this.staffRepository.findOne(id);
			result.isActive = false;
			await result.save();
			return { success: true, result };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async enableStaff(id: number) {
		try {
			const result = await this.staffRepository.findOne(id);
			result.isActive = true;
			await result.save();
			return { success: true, result };
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
