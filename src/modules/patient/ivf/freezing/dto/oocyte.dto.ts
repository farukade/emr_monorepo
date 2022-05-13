import { ApiProperty } from '@nestjs/swagger';
import { SpermOocyteDonor } from '../entities/donor.entity';

export class OocyteDto {
	@ApiProperty()
	date?: string;
	@ApiProperty()
	numOfOocyte?: number;
	@ApiProperty()
	grade: string;
	@ApiProperty()
	numOfStems: number;
	@ApiProperty()
	dewar: number;
	@ApiProperty()
	position: number;
	@ApiProperty()
	description: string;
	@ApiProperty()
	mediaUsed: string;
	@ApiProperty()
	donor: SpermOocyteDonor;
}
