import { Diagnosis } from '../../entities/diagnosis.entity';

export class DiagnosisPaginationDto {
		total: number;

		data: Diagnosis[];

		size: number;

		lastPage: number;

		page: any;

}
