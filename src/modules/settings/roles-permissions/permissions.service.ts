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

	async getAllPermissions(params): Promise<Permission[]> {
		const { q } = params;

		const query = this.permissionRepository.createQueryBuilder('p').select('p.*');

		if (q && q !== '') {
			query.andWhere('LOWER(p.name) Like :name', { name: `%${q.toLowerCase()}%` });
		}

		const permissions = await query.orderBy('p.createdAt', 'DESC').getRawMany();

		let result = [];
		for (const item of permissions) {
			if (item.category_id) {
				item.category = await this.departmentRepository.findOne(item.category_id);
			}

			result = [...result, item];
		}

		return result;
	}

	async createPermission(permissionDto: PermissionsDto, username: string): Promise<Permission> {
		const { name } = permissionDto;

		const permission = await this.permissionRepository.findOne({ where: { slug: slugify(name) } });

		if (permission) {
			throw new NotFoundException(`Permission '${permission.name}' already exists`);
		}

		const category = await this.departmentRepository.findOne(permissionDto.department_id);

		return this.permissionRepository.createPermission(permissionDto, category, username);
	}

	async updatePermission(id: string, permissionDto: PermissionsDto, updatedBy: string): Promise<Permission> {
		const { name, department_id } = permissionDto;

		const category = await this.departmentRepository.findOne(department_id);

		const permission = await this.permissionRepository.findOne(id);

		if (!permission) {
			throw new NotFoundException(`Permission '${permission.name}' not found!`);
		}

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
