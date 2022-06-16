import { ApiProperty } from "@nestjs/swagger";

export class AttendanceDto {
	@ApiProperty()
	staff_id: number;

    @ApiProperty()
    date: string;

    @ApiProperty()
    userDeviceId: number;

    @ApiProperty()
    ip: number;
}
