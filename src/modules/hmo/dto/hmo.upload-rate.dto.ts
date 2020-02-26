import { IsNotEmpty } from 'class-validator';

export class HmoUploadRateDto {

    @IsNotEmpty()
    hmo_id: string;

    uploadType: string;
}
