import { ApiProperty } from '@nestjs/swagger';
import { IvfEmbryoTransferRecord } from '../entities/embryo-trans-record.entity';

export class EmbryoTransferDto {
  @ApiProperty()
  embryologyId: number;

  @ApiProperty()
  nameOfEmbryoTransfered: string;

  @ApiProperty()
  numOfEmbryoTransfered: number;

  @ApiProperty()
  dateOfEmbryoTransfered: string;

  @ApiProperty()
  dr: string;

  @ApiProperty()
  embryologistId: number;

  @ApiProperty()
  date: string;

  @ApiProperty()
  numOfEmbryoVit: number;

  @ApiProperty()
  numOfStraws: number;

  @ApiProperty()
  patientId: number;

  @ApiProperty()
  transRecord: IvfEmbryoTransferRecord[];
}
