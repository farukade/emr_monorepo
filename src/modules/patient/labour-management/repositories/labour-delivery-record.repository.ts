import { EntityRepository, Repository } from 'typeorm';
import { LabourDeliveryRecord } from '../entities/labour_delivery_record.entity';

@EntityRepository(LabourDeliveryRecord)
export class LabourDeliveryRecordRepository extends Repository<LabourDeliveryRecord> {}
