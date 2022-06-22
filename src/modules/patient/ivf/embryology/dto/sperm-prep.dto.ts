import { ApiProperty } from '@nestjs/swagger';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';

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
  withdrawalMethod: string;
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
}
