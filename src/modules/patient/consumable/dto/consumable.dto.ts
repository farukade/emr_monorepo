import { IsNotEmpty } from 'class-validator';

export class PatientConsumableDto {
  @IsNotEmpty()
  consumable_id: string;

  quantity: any;

  @IsNotEmpty()
  patient_id: string;

  encounter_id: string;

  request_note: string;

  module: string;

  item_id: any;
}
