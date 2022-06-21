import { ApiProperty } from '@nestjs/swagger';

export class EmbryoTreatmentDto {
  @ApiProperty()
  embryologyId: number;
  @ApiProperty()
  treatmentChartType: string;
  @ApiProperty()
  isHIVPositive: boolean;
  @ApiProperty()
  isHBSagPositive: boolean;
  @ApiProperty()
  isHcvPositive: boolean;
  @ApiProperty()
  fsh: string;
  @ApiProperty()
  lh: string;
  @ApiProperty()
  prl: string;
  @ApiProperty()
  tsh: string;
  @ApiProperty()
  amh: string;
  @ApiProperty()
  tes: string;
  @ApiProperty()
  numOfEggsReceived: number;
  @ApiProperty()
  instructionsForLab: number;
  @ApiProperty()
  method: string;
  @ApiProperty()
  time: string;
  @ApiProperty()
  leftOvary: string;
  @ApiProperty()
  rightOvary: string;
  @ApiProperty()
  ocrDr: string;
  @ApiProperty()
  embr: string;
  @ApiProperty()
  numOfDocytes: number;
  @ApiProperty()
  total: number;
}
