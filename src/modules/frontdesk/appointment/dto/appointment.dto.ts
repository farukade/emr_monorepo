import { IsNotEmpty } from "class-validator";

export class AppointmentDto {
    @IsNotEmpty()
    patient_id: string

    @IsNotEmpty()
    department_id: string;

    @IsNotEmpty()
    serviceType: string;

    appointment_date: string;

    @IsNotEmpty()
    specialization_id: string;

    @IsNotEmpty()
    consulting_room_id: string;

    duration: string;

    description: string;

    referredBy: string;

    referralCompany: string;

    sendToQueue: boolean;
}