import { IsNotEmpty } from 'class-validator';

export class LeaveApplicationDto {
	@IsNotEmpty()
	start_date: string;

	@IsNotEmpty()
	end_date: string;

	@IsNotEmpty()
	staff_id: string;

	@IsNotEmpty()
	application: string;

	@IsNotEmpty()
	leave_category_id: string;

	appliedBy: string;

	diagnosis_id: string;
}
