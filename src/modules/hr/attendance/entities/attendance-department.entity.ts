import { CustomBaseEntity } from "src/common/entities/custom-base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DeviceIps } from "./device.entity";

@Entity({ name: 'attendance-department' })
export class AttendanceDepartment extends CustomBaseEntity {
    @Column({ unique: true })
    name: string;

    @Column({ default: true })
    isClinical: boolean;

    @ManyToOne((type) => DeviceIps)
    @JoinColumn({ name: 'device_id' })
    device: DeviceIps;
}