import { ApiProperty } from '@nestjs/swagger';

export class DeviceUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  staffId: number;

  @ApiProperty()
  departmentId: number;

  @ApiProperty()
  deviceId: number;
}
