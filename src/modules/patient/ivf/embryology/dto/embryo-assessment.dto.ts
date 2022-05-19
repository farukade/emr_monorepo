import { ApiProperty } from '@nestjs/swagger';

export class EmbryoAssessmentDto {
	@ApiProperty()
	embryologyId?: number;
	@ApiProperty()
	date: string;
	@ApiProperty()
	changeOverDoneBy: string;
	@ApiProperty()
	biopsyDoneBy: string;
	@ApiProperty()
	witness: string;
	@ApiProperty()
	numOfClavingEmbryos: number;
	@ApiProperty()
	day2Comment: string;
	@ApiProperty()
	day3Comment: string;
	@ApiProperty()
	patientId: number;
}
