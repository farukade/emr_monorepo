import { EntityRepository, Repository } from "typeorm";
import { DeviceIps } from "../entities/device.entity";

@EntityRepository(DeviceIps)
export class DeviceRepository extends Repository<DeviceIps> {
    
}