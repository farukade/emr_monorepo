import { ApiProperty } from '@nestjs/swagger';
import { IvfEmbryoTransfer } from '../entities/embryo-transfer.entity';

export class EmbryoTransferRecordDto {
	@ApiProperty()
	stage: string;
	@ApiProperty()
	grade: string;
	@ApiProperty()
	comments: string;
	@ApiProperty()
	icsi: string;
	@ApiProperty()
	ivf: string;
	@ApiProperty()
	ivfEmbryoTranfer: IvfEmbryoTransfer;
}
