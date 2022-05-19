import { ApiProperty } from '@nestjs/swagger';
import { SpermOocyteDonor } from '../entities/donor.entity';

export class SpermDto {
	@ApiProperty()
	date: string;
	@ApiProperty()
	timeDelivered: string;
	@ApiProperty()
	timeFrozen: string;
	@ApiProperty()
	cone: string;
	@ApiProperty()
	numOfVials: number;
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
