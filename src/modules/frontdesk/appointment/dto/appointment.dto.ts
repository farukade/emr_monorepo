import { IsNotEmpty } from 'class-validator';

export class AppointmentDto {
    appointment_date: string;

    @IsNotEmpty()
    consultation_id: string;

    @IsNotEmpty()
    department_id: string;

    description: string;

    @IsNotEmpty()
    doctor_id: string;

    @IsNotEmpty()
    patient_id: string;

    referredBy: string;

    referralCompany: string;

    sendToQueue: boolean;

    @IsNotEmpty()
    service: any;

    service_id: any;

    @IsNotEmpty()
    consulting_room_id: string;

}
