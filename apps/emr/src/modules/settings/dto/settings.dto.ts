import { IsNotEmpty } from 'class-validator';

export class SettingsDto {
  @IsNotEmpty()
  name: string;

  value: string;
}
