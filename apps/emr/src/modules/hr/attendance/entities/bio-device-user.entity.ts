import { Patient } from "apps/emr/src/modules/patient/entities/patient.entity";
import { Department } from "apps/emr/src/modules/settings/entities/department.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { StaffDetails } from "../../staff/entities/staff_details.entity";
import { DeviceIps } from "./device.entity";

@Entity({ name: 'bio_device_user' })
export class BioDeviceUser {
  @Column({ unique: true, primary: true })
  id: number;

  @ManyToOne((type) => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  other_names: string;

  @ManyToOne((type) => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne((type) => DeviceIps)
  @JoinColumn({ name: 'device_id' })
  device: DeviceIps;
}