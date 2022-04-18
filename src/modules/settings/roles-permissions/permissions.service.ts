import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from './permission.repository';
import { slugify } from '../../../common/utils/utils';
import { DepartmentRepository } from '../departments/department.repository';

@Injectable()
export class PermissionsService {
	constructor(
		@InjectRepository(PermissionRepository)
		private permissionRepository: PermissionRepository,
		@InjectRepository(DepartmentRepository)
		private departmentRepository: DepartmentRepository,
	) {}

	async getAllPermissions(): Promise<Permission[]> {
		return await this.permissionRepository.find();
	}

	async getPermissionById(id: string): Promise<Permission> {
		const found = this.permissionRepository.findOne(id);

		if (!found) {
			throw new NotFoundException(`Permission with ID '${id}' not found`);
		}

		return found;
	}

	async createPermission(
		permissionDto: PermissionsDto,
		username: string,
	): Promise<Permission> {
		const category = await this.departmentRepository.findOne(
			permissionDto.department_id,
		);

		return this.permissionRepository.createPermission(
			permissionDto,
			category,
			username,
		);
	}

	async updatePermission(
		id: string,
		permissionDto: PermissionsDto,
		updatedBy: string,
	): Promise<Permission> {
		const { name, department_id } = permissionDto;

		const category = await this.departmentRepository.findOne(department_id);

		const permission = await this.getPermissionById(id);
		permission.name = name;
		permission.slug = slugify(name);
		permission.category = category;
		permission.lastChangedBy = updatedBy;
		await permission.save();
		return permission;
	}

	async deletePermission(id: string): Promise<void> {
		const result = await this.permissionRepository.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException(`Permission with ID '${id}' not found`);
		}
	}
}
