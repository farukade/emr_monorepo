import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { Connection, getRepository, MoreThan, Raw } from 'typeorm';
import { PaginationOptionsInterface } from '../../common/paginate';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { Patient } from '../patient/entities/patient.entity';
import { Pagination } from '../../common/paginate/paginate.interface';
import * as moment from 'moment';
import { TransactionCreditDto } from '../finance/transactions/dto/transaction-credit.dto';
import { postCredit, postDebit } from '../../common/utils/utils';
import { Admission } from '../patient/admissions/entities/admission.entity';
import { CafeteriaFoodItemRepository } from './repositories/cafeteria.food-item.repository';
import { CafeteriaFoodItem } from './entities/food_item.entity';
import { CafeteriaFoodItemDto } from './dto/cafeteria-food-item.dto';
import { StaffRepository } from '../hr/staff/staff.repository';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { AdmissionsRepository } from '../patient/admissions/repositories/admissions.repository';
import { NicuRepository } from '../patient/nicu/nicu.repository';
import { PaymentMethodRepository } from '../settings/payment-methods/pm.repository';
import { HmoSchemeRepository } from '../hmo/repositories/hmo_scheme.repository';
import { Transaction } from '../finance/transactions/transaction.entity';

@Injectable()
export class CafeteriaService {
  constructor(
    @InjectRepository(CafeteriaItemRepository)
    private cafeteriaItemRepository: CafeteriaItemRepository,
    @InjectRepository(CafeteriaFoodItemRepository)
    private cafeteriaFoodItemRepository: CafeteriaFoodItemRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(AdmissionsRepository)
    private admissionsRepository: AdmissionsRepository,
    @InjectRepository(NicuRepository)
    private nicuRepository: NicuRepository,
    @InjectRepository(PaymentMethodRepository)
    private paymentMethodRepository: PaymentMethodRepository,
    @InjectRepository(HmoSchemeRepository)
    private hmoSchemeRepository: HmoSchemeRepository,
  ) {}

  async getAllItems(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { q, approved } = params;

    const page = options.page - 1;

    let where = {};

    if (approved && approved !== '') {
      where = { ...where, approved };
    }

    if (q && q !== '') {
      where = { ...where, name: Raw((alias) => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) };
    }

    const [result, total] = await this.cafeteriaItemRepository.findAndCount({
      where,
      take: options.limit,
      skip: page * options.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async createItem(itemDto: CafeteriaItemDto, username): Promise<CafeteriaItem> {
    const { item_id, quantity } = itemDto;

    const foodItem = await this.cafeteriaFoodItemRepository.findOne(item_id);

    return await this.cafeteriaItemRepository.save({
      foodItem,
      quantity,
      createdBy: username,
    });
  }

  async updateItem(id: number, itemDto: CafeteriaItemDto, username): Promise<CafeteriaItem> {
    const { item_id, quantity } = itemDto;

    const foodItem = await this.cafeteriaFoodItemRepository.findOne(item_id);

    const item = await this.cafeteriaItemRepository.findOne(id);
    item.foodItem = foodItem;
    item.quantity = quantity;
    item.lastChangedBy = username;

    return await item.save();
  }

  async approveItem(id: number, params, username): Promise<CafeteriaItem> {
    const { approved } = params;

    const inventory = await this.cafeteriaItemRepository.findOne(id);
    inventory.approved = approved;
    inventory.approved_by = username;
    inventory.approved_at = moment().format('YYYY-MM-DD HH:mm:ss');

    return await inventory.save();
  }

  async deleteItem(id: number, username): Promise<any> {
    const item = await this.cafeteriaItemRepository.findOne(id);

    if (!item) {
      throw new NotFoundException(`Inventory item with ID '${id}' not found`);
    }
    item.deletedBy = username;
    await item.save();

    return item.softRemove();
  }

  async getShowcaseItems(): Promise<any> {
    const query = await getRepository(CafeteriaItem)
      .createQueryBuilder('c')
      .select('c.food_item_id as food_item_id')
      .groupBy('food_item_id')
      .getRawMany();

    let results = [];

    for (const item of query) {
      const foodItem = await this.cafeteriaFoodItemRepository.findOne(item.food_item_id);
      const items = await this.cafeteriaItemRepository.find({ where: { foodItem } });
      const cafeteriaItem = items.length > 0 ? items[0] : null;
      if (cafeteriaItem) {
        const quantity = items.reduce((total, food_item) => total + food_item.quantity, 0);

        results = [...results, { id: cafeteriaItem.foodItem.id, foodItem: cafeteriaItem.foodItem, quantity }];
      }
    }

    return results;
  }

  async saveSales(param: CafeteriaSalesDto, username: string): Promise<any> {
    try {
      const { cartItems, customer, patient_id, staff_id, staff_total, total, payment_method, paid } = param;

      const hasPaid: boolean = Number(paid) >= (Number(staff_total) || Number(total));
      const paidPart: boolean = hasPaid ? false : Number(paid) > 0;
      let emptyStock = [];
      for (const sale of cartItems) {
        const stock = await this.cafeteriaItemRepository.findOne(sale.id);
        if (sale.qty === '' || Number(sale.qty) === 0 || Number(sale.qty) > stock.quantity) {
          emptyStock = [...emptyStock, stock];
        }
      }

      if (emptyStock.length > 0) {
        return { success: false, message: `${emptyStock.map((s) => `${s.name} has finished`).join(', ')}` };
      }

      let patient = null;
      if (customer === 'patient' && patient_id) {
        patient = await this.patientRepository.findOne(patient_id);
      }

      let staff = null;
      let staffHmo = null;
      if (customer === 'staff' && staff_id) {
        staff = await this.staffRepository.findOne(staff_id);
        staffHmo = await this.hmoSchemeRepository.findOne(5);
      }

      let admission;
      let nicu;
      if (patient !== null) {
        admission = await this.admissionsRepository.findOne({ where: { patient, status: 0 } });

        nicu = await this.nicuRepository.findOne({ where: { patient, status: 0 } });
      }

      for (const item of cartItems) {
        const foodItem = await this.cafeteriaFoodItemRepository.findOne(item.id);
        const quantity = parseInt(item.qty, 10);
        for (let i = 0; i < quantity; i++) {
          const singleItem = await this.cafeteriaItemRepository.findOne({ where: { foodItem, quantity: MoreThan(0) } });
          if (singleItem) {
            singleItem.quantity = singleItem.quantity - 1;
            await singleItem.save();
          } else {
            return {
              success: false,
              message: 'item not found',
            };
          }
        }
      }

      const method = await this.paymentMethodRepository.findOne(payment_method);

      const totalAmount = customer === 'staff' ? staff_total : total;
      const balance = Number(paid) - Number(totalAmount);

      let times: number;
      let remains: number;
      let firstPay: number;
      switch (customer) {
        case 'staff':
          if (hasPaid) {
            times = 1;
          } else if (paidPart) {
            times = 2;
            firstPay = Number(paid);
            remains = Number(totalAmount) - Number(paid);
          } else {
            times = 1;
          }
          break;
        case 'customer':
          if (hasPaid) {
            times = 1;
          } else if (paidPart) {
            times = 2;
            firstPay = Number(paid);
            remains = Number(totalAmount) - Number(paid);
          } else {
            times = 1;
          }
          break;
        default:
          times = 1;
          break;
      }

      const hmo = customer === 'patient' ? patient.hmo : staffHmo;

      console.log('firstpay: ' + firstPay + ', \n' + 'secondpay: ' + remains);

      let transactionArr = [];
      for (let i = 0; i < times; i++) {
        const item: TransactionCreditDto = {
          patient_id: patient?.id || null,
          username,
          sub_total: 0,
          vat: 0,
          amount: paidPart ? (i == 0 ? firstPay * -1 : remains * -1) : Number(totalAmount) * -1,
          voucher_amount: 0,
          amount_paid: paidPart ? (i == 0 ? Number(paid) : 0) : Number(paid),
          change: paidPart ? 0 : Number(totalAmount) - Number(paid),
          description: null,
          payment_method: null,
          part_payment_expiry_date: null,
          bill_source: 'cafeteria',
          next_location: null,
          status: paid ? (i == 0 ? 1 : -1) : -1,
          hmo_approval_code: null,
          transaction_details: cartItems,
          admission_id: admission?.id || null,
          nicu_id: nicu?.id || null,
          staff_id: customer === 'staff' ? staff?.id : null,
          lastChangedBy: username,
        };

        let transaction = await postDebit(item, null, null, null, null, await hmo);
        transactionArr = [transaction, ...transactionArr];
        console.log('debit');

        if (Number(paid) > 0 && i < 1) {
          const credit = { ...item, amount_paid: paid, change: balance, payment_method: method.name };
          await postCredit(credit, null, null, null, null, await hmo);
          console.log('credit');
        }
      }

      return { success: true, transaction: transactionArr };
      // return { success: false, message: 'Error, could not make sales' };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async getFoodItems(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { q } = params;

    const page = options.page - 1;

    let where = {};

    if (q && q !== '') {
      where = { ...where, name: Raw((alias) => `LOWER(${alias}) LIKE '%${q.toLowerCase()}%'`) };
    }

    const [result, total] = await this.cafeteriaFoodItemRepository.findAndCount({
      where,
      take: options.limit,
      skip: page * options.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async createFoodItem(itemDto: CafeteriaFoodItemDto, username): Promise<CafeteriaFoodItem> {
    const { name, description, price, discount_price, staff_price, unit } = itemDto;

    return await this.cafeteriaFoodItemRepository.save({
      name,
      description,
      price,
      discount_price,
      staff_price,
      unit,
      createdBy: username,
    });
  }

  async updateFoodItem(id: number, itemDto: CafeteriaFoodItemDto, username: string): Promise<CafeteriaFoodItem> {
    const { name, description, price, discount_price, staff_price, unit } = itemDto;

    const foodItem = await this.cafeteriaFoodItemRepository.findOne(id);
    if (!foodItem) {
      throw new BadRequestException('Error, food item not found');
    }

    foodItem.name = name;
    foodItem.description = description;
    foodItem.price = price;
    foodItem.discount_price = discount_price;
    foodItem.staff_price = staff_price;
    foodItem.unit = unit;
    foodItem.lastChangedBy = username;

    return await foodItem.save();
  }
}
