import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { getRepository, MoreThan, Not, Raw } from 'typeorm';
import { PaginationOptionsInterface } from '../../common/paginate';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { Pagination } from '../../common/paginate/paginate.interface';
import * as moment from 'moment';
import { TransactionCreditDto } from '../finance/transactions/dto/transaction-credit.dto';
import { patientname, postCredit, postDebit, slugify, staffname } from '../../common/utils/utils';
import { CafeteriaFoodItemRepository } from './repositories/cafeteria.food-item.repository';
import { CafeteriaFoodItem } from './entities/food_item.entity';
import { CafeteriaFoodItemDto } from './dto/cafeteria-food-item.dto';
import { StaffRepository } from '../hr/staff/staff.repository';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { AdmissionsRepository } from '../patient/admissions/repositories/admissions.repository';
import { NicuRepository } from '../patient/nicu/nicu.repository';
import { PaymentMethodRepository } from '../settings/payment-methods/pm.repository';
import { OrderDto } from './dto/order.dto';
import { CafeteriaOrder } from './entities/order.entity';
import { OrderRepository } from './repositories/order.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import { AppGateway } from '../../app.gateway';

@Injectable()
export class CafeteriaService {
  constructor(
    private readonly appGateway: AppGateway,
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
    @InjectRepository(OrderRepository)
    private orderRepository: OrderRepository,
    @InjectRepository(TransactionsRepository)
    private transactionRepository: TransactionsRepository,
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

  async getShowcaseItems(params): Promise<any> {
    const { q } = params;

    const query = getRepository(CafeteriaItem)
      .createQueryBuilder('c')
      .select('c.food_item_id as food_item_id')
      .groupBy('food_item_id')
      .innerJoin(CafeteriaFoodItem, 'f', 'f.id = c.food_item_id');

    if (q && q !== '') {
      query.where('LOWER(f.name) Like :name', { name: `%${q.toLowerCase()}%` });
    }

    const rs = await query.getRawMany();

    let results = [];

    for (const item of rs) {
      const foodItem = await this.cafeteriaFoodItemRepository.findOne(item.food_item_id);
      const showcaseItems = await this.cafeteriaItemRepository.find({ where: { foodItem } });
      const showCaseItem = showcaseItems.length > 0 ? showcaseItems[0] : null;
      if (showCaseItem) {
        const quantity = showcaseItems.reduce((total, food_item) => total + food_item.quantity, 0);

        results = [...results, { id: showCaseItem.foodItem.id, foodItem: showCaseItem.foodItem, quantity }];
      }
    }

    return results;
  }

  async getFoodItems(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { q, category } = params;

    const page = options.page - 1;

    let where = {};

    if (category && category !== '') {
      where = { ...where, category_slug: 'show-case' };
    }

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
    const { name, description, price, discount_price, staff_price, unit, category } = itemDto;

    const foodItem = await this.cafeteriaFoodItemRepository.save({
      name,
      description,
      price,
      discount_price,
      staff_price,
      unit,
      category,
      category_slug: slugify(category),
      createdBy: username,
    });

    if (foodItem.category_slug !== 'show-case') {
      await this.cafeteriaItemRepository.save({
        foodItem,
        quantity: -1,
        approved: 1,
        approved_by: username,
        approved_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        createdBy: username,
      });
    }

    return foodItem;
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
    const rs = await foodItem.save();

    return rs;
  }

  async updateFoodItemCategory(id: number, username: string): Promise<CafeteriaFoodItem> {
    const foodItem = await this.cafeteriaFoodItemRepository.findOne(id);
    if (!foodItem) {
      throw new BadRequestException('Error, food item not found');
    }

    const category = 'A La Carte';

    foodItem.category = category;
    foodItem.category_slug = slugify(category);
    foodItem.lastChangedBy = username;
    const rs = await foodItem.save();

    const showcaseItems = await this.cafeteriaItemRepository.find({ foodItem });
    if (showcaseItems.length > 0) {
      for (const item of showcaseItems) {
        const showcaseItem = await this.cafeteriaItemRepository.findOne(item.id);
        if (showcaseItem) {
          showcaseItem.deletedBy = username;
          await showcaseItem.save();
          await showcaseItem.softRemove();
        }
      }
    }

    await this.cafeteriaItemRepository.save({
      foodItem,
      quantity: -1,
      approved: 1,
      approved_by: username,
      approved_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });

    return rs;
  }

  async takeOrder(param: OrderDto, username: string): Promise<any> {
    try {
      const { cartItems, customer, patient_id, staff_id } = param;

      for (const item of cartItems) {
        const foodItem = await this.cafeteriaFoodItemRepository.findOne(item.id);
        const quantity = parseInt(item.qty, 10);
        for (let i = 0; i < quantity; i++) {
          const showcaseItem = await this.cafeteriaItemRepository.findOne({
            where: { foodItem, quantity: MoreThan(0) },
            relations: ['foodItem'],
          });
          if (showcaseItem && showcaseItem.foodItem.category_slug === 'show-case') {
            showcaseItem.quantity = showcaseItem.quantity - 1;
            showcaseItem.lastChangedBy = username;
            await showcaseItem.save();
          }
        }
      }

      let name = null;

      let patient = null;
      if (customer === 'patient' && patient_id) {
        patient = await this.patientRepository.findOne(patient_id);
        name = patientname(patient);
      }

      let staff = null;
      if (customer === 'staff' && staff_id) {
        staff = await this.staffRepository.findOne(staff_id);
        name = staffname(staff);
      }

      if (customer === 'walk-in') {
        const lastOrder = await this.orderRepository.findOne({ where: { customer }, order: { createdAt: 'DESC' } });
        const guest = lastOrder?.name?.split('-') || [];
        const count = guest.length > 0 ? Number(guest[1]) + 1 : 1;
        name = `Guest-${count}`;
      }

      let orders = [];
      for (const item of cartItems) {
        const foodItem = await this.cafeteriaFoodItemRepository.findOne(item.id);

        const order = new CafeteriaOrder();
        order.customer = customer;
        order.patient = patient;
        order.staff = staff;
        order.name = name;
        order.foodItem = foodItem;
        order.quantity = Number(item.qty);
        order.amount = customer === 'staff' && staff ? Number(foodItem.staff_price) : Number(foodItem.price);
        order.createdBy = username;

        if (foodItem.category_slug === 'show-case') {
          order.status = 1;
          order.ready_at = moment().format('YYYY-MM-DD HH:mm:ss');
          order.ready_by = username;
        }

        const rs = await this.orderRepository.save(order);

        orders = [...orders, rs];
      }

      return { success: true, data: orders };
    } catch (error) {
      console.log(error);
      return new BadRequestException({ success: false, message: error.message });
    }
  }

  async getOrders(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { status } = params;

    const query = this.orderRepository.createQueryBuilder('o').select('o.*');

    const page = options.page - 1;

    if (status && status !== '') {
      query.andWhere('o.status = :status', { status });
    }

    const orders = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('o.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const item of orders) {
      const foodItem = await this.cafeteriaFoodItemRepository.findOne(item.food_item_id);

      let patient;
      if (item.patient_id) {
        patient = await this.patientRepository.findOne(item.patient_id);
        patient.admission = patient.admission_id
          ? await this.admissionsRepository.findOne(patient.admission_id, { relations: ['room', 'room.category'] })
          : null;
      }

      let staff;
      if (item.staff_id) {
        staff = await this.staffRepository.findOne(item.staff_id);
      }

      let transaction;
      if (item.transaction_id) {
        transaction = await this.transactionRepository.findOne(item.transaction_id);
      }

      result = [...result, { ...item, foodItem, patient, staff, transaction }];
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async cancelOrder(id: number, username: string): Promise<any> {
    try {
      const order = await this.orderRepository.findOne(id);
      if (!order) {
        throw new BadRequestException('Error, order not found');
      }

      const item = await this.cafeteriaItemRepository.findOne({
        where: { foodItem: order.foodItem },
        relations: ['foodItem'],
      });
      if (item && item.foodItem.category_slug === 'show-case') {
        item.quantity = Number(item.quantity) + Number(order.quantity);
        item.lastChangedBy = username;
        await item.save();
      }

      order.status = -1;
      order.cancelled_at = moment().format('YYYY-MM-DD HH:mm:ss');
      order.cancelled_by = username;
      const rs = await order.save();

      return { success: true, data: rs };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async readyOrder(id: number, username: string): Promise<any> {
    try {
      const order = await this.orderRepository.findOne(id);
      if (!order) {
        throw new BadRequestException('Error, order not found');
      }

      order.status = 1;
      order.ready_at = moment().format('YYYY-MM-DD HH:mm:ss');
      order.ready_by = username;
      const rs = await order.save();

      return { success: true, data: rs };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async saveSales(param: CafeteriaSalesDto, username: string): Promise<any> {
    try {
      const { cartItems, customer, patient_id, staff_id, balance, paid, total, payment_method, pay_later } = param;

      let patient = null;
      let admission = null;
      let nicu = null;

      if (customer === 'patient' && patient_id) {
        patient = await this.patientRepository.findOne(patient_id);

        admission = await this.admissionsRepository.findOne({
          where: { patient, status: 0 },
        });

        nicu = await this.nicuRepository.findOne({
          where: { patient, status: 0 },
        });
      }

      let staff = null;
      if (customer === 'staff' && staff_id) {
        staff = await this.staffRepository.findOne(staff_id);
      }

      const debit: TransactionCreditDto = {
        patient_id: patient?.id || null,
        username,
        sub_total: 0,
        vat: 0,
        amount: Number(total) * -1,
        voucher_amount: 0,
        amount_paid: 0,
        change: 0,
        description: 'Payment for cafeteria',
        payment_method: null,
        part_payment_expiry_date: null,
        bill_source: 'cafeteria',
        next_location: null,
        status: Number(pay_later) === 0 ? 0 : -1,
        hmo_approval_code: null,
        transaction_details: cartItems,
        admission_id: admission?.id || null,
        nicu_id: nicu?.id || null,
        staff_id: customer === 'staff' ? staff?.id : null,
        lastChangedBy: username,
      };

      const payment = await postDebit(debit, null, null, null, null, null);

      let transaction = payment;
      if (Number(pay_later) === 0) {
        const method = await this.paymentMethodRepository.findOne(payment_method);

        // approve debit
        payment.status = 1;
        payment.lastChangedBy = username;
        payment.amount_paid = Math.abs(paid);
        payment.payment_method = method.name;
        await payment.save();

        const credit = {
          ...debit,
          status: 1,
          lastChangedBy: username,
          amount_paid: Number(paid),
          payment_method: method.name,
          change: Number(balance),
        };
        transaction = await postCredit(credit, null, null, null, null, null);
      }

      for (const item of cartItems) {
        const order = await this.orderRepository.findOne(item.id);
        order.transaction = transaction;
        order.status = Number(pay_later) === 0 ? 2 : -2;
        await order.save();
      }

      return { success: true, data: { ...transaction, patient, dedastaff: staff } };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }
}
