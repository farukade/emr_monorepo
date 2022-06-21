import { ApiProperty } from '@nestjs/swagger';

export class SpermDto {
  @ApiProperty()
  gender: string;
  @ApiProperty()
  age: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  bloodGroup: string;
  @ApiProperty()
  genotype: string;
  @ApiProperty()
  height: number;
  @ApiProperty()
  weight: number;
  @ApiProperty()
  bmi: string;
  @ApiProperty()
  complexion: string;
  @ApiProperty()
  stateOfOrigin: string;
}
