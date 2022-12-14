import { ApiProperty } from "@nestjs/swagger";

export class ChatDto {
    @ApiProperty()
    sender_id: number;

    @ApiProperty()
    recipient_id: number;

    @ApiProperty()
    body: string;

    @ApiProperty()
    room_id?: number;

    @ApiProperty()
    is_sent?: boolean;
}