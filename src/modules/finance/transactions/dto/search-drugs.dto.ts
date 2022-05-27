import { ApiProperty } from "@nestjs/swagger";

export class DrugTransactionSearchDto {
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
}