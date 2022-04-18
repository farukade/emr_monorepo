import { IsNotEmpty } from 'class-validator';

export class PermissionsDto {
	@IsNotEmpty()
	name: string;

	department_id: any;
}
