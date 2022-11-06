import { ApiProperty } from '@nestjs/swagger';
import { CellInfo } from '../entities/cell-info.entity';

export class EmbryoSpermPrepDto {
  @ApiProperty()
  embryologyId?: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  donorCode: string;

  @ApiProperty()
  viscousity: string;

  @ApiProperty()
  timeOfProduction: string;

  @ApiProperty()
  timeReceived: string;

  @ApiProperty()
  timeAnalyzed: string;

  @ApiProperty()
  witness: string;

  @ApiProperty()
  embryologistId: number;

  @ApiProperty()
  cellInfo: CellInfo[];
}
