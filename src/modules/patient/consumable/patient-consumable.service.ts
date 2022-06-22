import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientConsumableRepository } from './patient-consumable.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { PatientConsumableDto } from './dto/consumable.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { StoreInventoryRepository } from '../../inventory/store/store.repository';

@Injectable()
export class PatientConsumableService {
  constructor(
    @InjectRepository(PatientConsumableRepository)
    private patientConsumableRepository: PatientConsumableRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(StoreInventoryRepository)
    private storeInventoryRepository: StoreInventoryRepository,
  ) {}

  async getConsumables(id: number, options: PaginationOptionsInterface, urlParams): Promise<Pagination> {
    const { item_id, type } = urlParams;

    const page = options.page - 1;

    const query = this.patientConsumableRepository
      .createQueryBuilder('c')
      .select('c.*')
      .where('c.patient_id = :patient_id', { patient_id: id });

    if (type && type !== '') {
      query.andWhere('c.module = :type', { type });
    }

    if (item_id && item_id !== '') {
      query.andWhere('c.item_id = :item_id', { item_id });
    }

    const consumables = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('c.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const item of consumables) {
      item.patient = await this.patientRepository.findOne({
        where: { id: item.patient_id },
        relations: ['nextOfKin', 'immunization', 'hmo'],
      });

      item.comsumable = await this.storeInventoryRepository.findOne(item.consumable_id);

      result = [...result, item];
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async saveConsumable(param: PatientConsumableDto, username: string): Promise<any> {
    try {
      const { consumable_id, quantity, patient_id, request_note, module, item_id } = param;

      const patient = await this.patientRepository.findOne(patient_id);
      const item = await this.storeInventoryRepository.findOne(consumable_id);

      const consumable = new PatientConsumable();
      consumable.consumable = item;
      consumable.quantity = quantity;
      consumable.patient = patient;
      consumable.request_note = request_note;
      consumable.module = module;
      consumable.item_id = item_id;
      consumable.createdBy = username;

      const rs = await consumable.save();

      return { success: true, consumable: rs };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updateConsumable(id: number, consumableDto: PatientConsumableDto, createdBy) {
    return null;
  }

  async deleteConsumable(id: number, username): Promise<PatientConsumable> {
    return null;
  }
}
