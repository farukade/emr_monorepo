import { IsNotEmpty } from 'class-validator';

export class DoctorsAppointmentDto {
  @IsNotEmpty()
  appointment_time: string;

  @IsNotEmpty()
  appointment_date: string;

  @IsNotEmpty()
  department_id: string;

  description: string;

  @IsNotEmpty()
  doctor_id: string;

  @IsNotEmpty()
  patient_id: string;

  isOnline: boolean;
}
