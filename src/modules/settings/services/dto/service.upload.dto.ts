import { IsNotEmpty } from 'class-validator';

export class ServicesUploadRateDto {

    @IsNotEmpty()
    hmo_id: number;

}
