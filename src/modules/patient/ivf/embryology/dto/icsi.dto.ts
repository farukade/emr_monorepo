import { ApiProperty } from '@nestjs/swagger';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { IcsiDayRecord } from '../entities/day-record.entity';

export class EmbryoIcsiDto {
  @ApiProperty()
  embryologyId: number;

  @ApiProperty()
  time: string;

  @ApiProperty()
  mii: string;

  @ApiProperty()
  migv: string;

  @ApiProperty()
  frag: string;

  @ApiProperty()
  abn: string;

  @ApiProperty()
  icsiMethod: string;

  @ApiProperty()
  opDate: string;

  @ApiProperty()
  docyteInjected: number;

  @ApiProperty()
  docyteInseminated: number;

  @ApiProperty()
  totalDocyte: number;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  witness: string;

  @ApiProperty()
  embryologistId: number;

  @ApiProperty()
  dayOne: IcsiDayRecord[];
}
