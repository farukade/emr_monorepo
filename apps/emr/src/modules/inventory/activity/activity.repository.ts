import { EntityRepository, Repository } from 'typeorm';
import { InventoryActivity } from '../entities/activity.entity';

@EntityRepository(InventoryActivity)
export class InventoryActivityRepository extends Repository<InventoryActivity> {
  async saveActivity(param, username: string): Promise<InventoryActivity> {
    const { batch, store, cafeteria, quantity, unitPrice } = param;

    const activity = new InventoryActivity();
    activity.batch = batch;
    activity.store = store;
    activity.cafeteria = cafeteria;
    activity.quantity = quantity;
    activity.unitPrice = unitPrice;
    activity.createdBy = username;
    await activity.save();

    return activity;
  }
}
