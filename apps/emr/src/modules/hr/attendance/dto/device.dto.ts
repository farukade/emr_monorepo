import { ApiProperty } from "@nestjs/swagger";

export class DeviceDto {
    @ApiProperty()
    ip: string;

    @ApiProperty()
    name: string;
}