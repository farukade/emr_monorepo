import { CustomBaseEntity } from "src/common/entities/custom-base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AttendanceDepartment } from "./attendance-department.entity";
import { DeviceIps } from "./device.entity";

@Entity({ name: 'attendance-staff' })
export class AttendanceStaff extends CustomBaseEntity {
    @ManyToOne((type) => AttendanceDepartment)
    @JoinColumn({ name: 'department_id' })
    department: AttendanceDepartment;

    @Column()
    name: string;

    @Column({ unique: true })
    staffNum: string;

    @ManyToOne((type) => DeviceIps)
    @JoinColumn({ name: 'device_id' })
    device: DeviceIps;
}