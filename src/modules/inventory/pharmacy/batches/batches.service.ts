import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../../common/paginate';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { DrugBatchRepository } from './batches.repository';
import { Raw } from 'typeorm';
import { DrugBatchDto } from '../../dto/batches.dto';
import { DrugBatch } from '../../entities/batches.entity';
import { VendorRepository } from '../../vendor/vendor.repository';
import { Vendor } from '../../entities/vendor.entity';
import { DrugRepository } from '../drug/drug.repository';
import * as moment from 'moment';
import { InventoryActivityRepository } from '../../activity/activity.repository';
import { InventoryPurchase } from '../../entities/purchase.entity';

@Injectable()
export class DrugBatchService {
  constructor(
    @InjectRepository(DrugBatchRepository)
    private drugBatchRepository: DrugBatchRepository,
    @InjectRepository(VendorRepository)
    private vendorRepository: VendorRepository,
    @InjectRepository(DrugRepository)
    private drugRepository: DrugRepository,
    @InjectRepository(InventoryActivityRepository)
    private inventoryActivityRepository: InventoryActivityRepository,
  ) {}

  async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { q, drug_id } = params;

    const page = options.page - 1;

    let extra;
    if (drug_id && drug_id !== '') {
      const drug = await this.drugRepository.findOne(drug_id);
      extra = { drug };
    }

    let result;
    let total = 0;
    if (q && q.length > 0) {
      [result, total] = await this.drugBatchRepository.findAndCount({
        where: {
          name: Raw((alias) => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
          ...extra,
        },
        relations: ['vendor'],
        order: { name: 'ASC' },
        take: options.limit,
        skip: page * options.limit,
      });
    } else {
      [result, total] = await this.drugBatchRepository.findAndCount({
        where: { ...extra },
        relations: ['vendor'],
        order: { name: 'ASC' },
        take: options.limit,
        skip: page * options.limit,
      });
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async create(drugBatchDto: DrugBatchDto, username: string): Promise<any> {
    try {
      const { quantity, expirationDate, unitPrice, vendor_id, drug_id, selling_price } = drugBatchDto;

      let vendor;
      if (vendor_id === '') {
        if (drugBatchDto.vendor) {
          const item = new Vendor();
          item.name = drugBatchDto.vendor.label;
          vendor = await item.save();
        }
      } else {
        vendor = await this.vendorRepository.findOne(vendor_id);
      }

      const month = moment().format('MM');
      const year = moment().format('YYYY');

      const drug = drug_id && drug_id !== '' ? await this.drugRepository.findOne(drug_id) : null;

      const batch = new DrugBatch();
      batch.name = `BA/${month}/${year}`;
      batch.quantity = quantity;
      batch.expirationDate = expirationDate;
      batch.costPrice = unitPrice;
      batch.unitPrice = selling_price || 0;
      batch.vendor = vendor;
      batch.drug = drug;
      const rs = await batch.save();

      await this.inventoryActivityRepository.saveActivity({ batch: rs, quantity, unitPrice }, username);

      const purchase = new InventoryPurchase();
      purchase.quantity = quantity;
      purchase.purchase_price = unitPrice;
      purchase.selling_price = selling_price || 0;
      purchase.vendor = vendor;
      purchase.item_id = rs.id;
      purchase.item_category = 'drug_batch';
      await purchase.save();

      return { success: true, batch: rs };
    } catch (e) {
      console.log(e);
      return { success: false, message: 'error could not create batch' };
    }
  }

  async update(id, drugBatchDto: DrugBatchDto, username: string): Promise<any> {
    try {
      const { quantity, expirationDate, unitPrice, vendor_id } = drugBatchDto;

      let vendor;
      if (vendor_id === '') {
        if (drugBatchDto.vendor) {
          const item = new Vendor();
          item.name = drugBatchDto.vendor.label;
          vendor = await item.save();
        }
      } else {
        vendor = await this.vendorRepository.findOne(vendor_id);
      }

      const batch = await this.drugBatchRepository.findOne(id);

      const month = moment(batch.createdAt).format('MM');
      const year = moment(batch.createdAt).format('YYYY');

      if (!batch.name || (batch.name && batch.name === '')) {
        batch.name = `BA/${month}/${year}`;
      }
      batch.quantity = quantity;
      batch.expirationDate = expirationDate;
      batch.unitPrice = unitPrice;
      batch.vendor = vendor;
      const rs = await batch.save();

      await this.inventoryActivityRepository.saveActivity({ batch: rs, quantity, unitPrice }, username);

      return { success: true, batch: rs };
    } catch (e) {
      console.log(e);
      return { success: false, message: 'error could not update batch' };
    }
  }

  async updateQty(id, drugBatchDto: DrugBatchDto, username: string): Promise<any> {
    try {
      const { quantity } = drugBatchDto;

      const batch = await this.drugBatchRepository.findOne(id, {
        relations: ['vendor'],
      });
      batch.quantity = batch.quantity + parseInt(quantity, 10);
      const rs = await batch.save();

      await this.inventoryActivityRepository.saveActivity({ batch: rs, quantity, unitPrice: batch.unitPrice }, username);

      // const vendor = await this.vendorRepository.findOne(batch.vendor.id);
      //
      // const purchase = new InventoryPurchase();
      // purchase.quantity = quantity;
      // purchase.purchase_price = batch.unitPrice;
      // purchase.vendor = vendor;
      // purchase.item_id = batch.id;
      // purchase.item_category = 'drug_batch';
      // await purchase.save();

      return { success: true, item: rs };
    } catch (e) {
      return { success: false, message: 'error could not update batch' };
    }
  }
}
