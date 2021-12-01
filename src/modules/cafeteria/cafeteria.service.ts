import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { Connection, Raw } from 'typeorm';
import { PaginationOptionsInterface } from '../../common/paginate';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { Patient } from '../patient/entities/patient.entity';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { Transaction } from '../finance/transactions/transaction.entity';
import { Pagination } from '../../common/paginate/paginate.interface';
import * as moment from 'moment';
import { TransactionCreditDto } from '../finance/transactions/dto/transaction-credit.dto';
import { postCredit, postDebit } from '../../common/utils/utils';
import { Admission } from '../patient/admissions/entities/admission.entity';

@Injectable()
export class CafeteriaService {
    constructor(
        @InjectRepository(CafeteriaItemRepository)
        private cafeteriaItemRepository: CafeteriaItemRepository,
        private connection: Connection,
    ) {
    }

    async getAllItems(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q, approved } = params;

        const page = options.page - 1;

        let where = {};

        if (approved && approved !== '') {
            where = {...where, approved};
        }

        if (q && q !== '') {
            where = { ...where, name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) };
        }

        const [result, total] = await this.cafeteriaItemRepository.findAndCount({
            where,
            take: options.limit,
            skip: (page * options.limit),
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
        const { name, price, description, quantity } = itemDto;

        return await this.cafeteriaItemRepository.save({
            name,
            price,
            quantity,
            description,
            createdBy: username,
        });
    }

    async updateItem(id: number, itemDto: CafeteriaItemDto, username): Promise<CafeteriaItem> {
        const { name, price, description, quantity } = itemDto;

        const item = await this.cafeteriaItemRepository.findOne(id);
        item.name = name;
        item.description = description;
        item.price = price;
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

    async saveSales(param: CafeteriaSalesDto, username: string): Promise<any> {
        const { user_type, user_id, sub_total, vat, total_amount, amount_paid, change, payment_method, items } = param;
        try {
            let emptyStock = [];
            for (const sale of items) {
                const stock = await this.cafeteriaItemRepository.findOne(sale.id);
                if (sale.qty === '' || sale.qty === 0 || sale.qty > stock.quantity) {
                    emptyStock = [...emptyStock, stock];
                }
            }

            if (emptyStock.length > 0) {
                return { success: false, message: `${emptyStock.map(s => `${s.name} has finished`).join(', ')}` };
            }

            let patient;
            let staff_id = null;
            let hmo = null;
            if (user_type === 'staff') {
                staff_id = user_id;
            } else if (user_type === 'patient') {
                patient = await this.connection.getRepository(Patient).findOne(user_id, { relations: ['hmo'] });

                hmo = patient.hmo;
            }

            let admission;
            if (patient !== null) {
               admission = await this.connection.getRepository(Admission).findOne({ where: { patient } });
            }

            let data = [];
            for (const sale of items) {
                const parentItem = await this.cafeteriaItemRepository.findOne(sale.id);
                data = [...data, {
                    id: parentItem.id,
                    name: parentItem.name,
                    price: parentItem.price,
                    qty: sale.qty,
                    amount: sale.amount,
                }];

                parentItem.quantity = parentItem.quantity - sale.qty;
                await parentItem.save();
            }

            const item: TransactionCreditDto = {
                patient_id: patient.id || null,
                username,
                sub_total,
                vat,
                amount: total_amount * -1,
                voucher_amount: 0,
                amount_paid: 0,
                change: 0,
                description: null,
                payment_method: null,
                part_payment_expiry_date: null,
                bill_source: 'cafeteria',
                next_location: null,
                status: 1,
                hmo_approval_code: null,
                transaction_details: data,
                admission_id: admission?.id || null,
                staff_id,
                lastChangedBy: username,
            };

            await postDebit(item, null, null, null, null, hmo);

            const credit = {...item, amount_paid, change, payment_method };
            const transaction = await postCredit(credit, null, null, null, null, hmo);

            return { success: true, transaction };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}
