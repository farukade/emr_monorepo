import { ApiProperty } from "@nestjs/swagger";

export class DeviceUserDto {
	@ApiProperty()
	name: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    staffId: number;
}
