import { ApiProperty } from '@nestjs/swagger';

export class AttendanceDepartmentDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  isClinical: boolean;

  @ApiProperty()
  deviceId: number;
}
