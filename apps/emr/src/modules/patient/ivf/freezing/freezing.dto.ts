import { ApiProperty } from '@nestjs/swagger';
import { OocyteEntity } from './entities/oocyte.entity';
import { SpermEntity } from './entities/sperm.entity';

export class FreezingDto {
  @ApiProperty()
  sperm: SpermEntity;
  @ApiProperty()
  oocyte: OocyteEntity;
}
