import { ApiProperty } from '@nestjs/swagger';

export class TransactionSearchDto {
  @ApiProperty()
  startDate?: string;

  @ApiProperty()
  endDate?: string;

  @ApiProperty()
  page: string;

  @ApiProperty()
  limit: string;

  @ApiProperty()
  term: string;

  @ApiProperty()
  bill_source: string;

  @ApiProperty()
  filter: string;

  @ApiProperty()
  type?: string;

  @ApiProperty()
  hmo_id?: string;

  @ApiProperty()
  category?: string;
}
