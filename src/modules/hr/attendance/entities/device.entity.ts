import { CustomBaseEntity } from "src/common/entities/custom-base.entity";
import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { AttendanceDepartment } from "./attendance-department.entity";

@Entity({ name: 'attendance-device' })
export class DeviceIps extends CustomBaseEntity {
    @Column()
    ip: string;

    @Column({ nullable: true })
    name: string;
}