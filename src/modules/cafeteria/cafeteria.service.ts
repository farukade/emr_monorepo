import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { Connection } from 'typeorm';
import { PaginationOptionsInterface } from '../../common/paginate';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { Patient } from '../patient/entities/patient.entity';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { Transactions } from '../finance/transactions/transaction.entity';
import { Pagination } from '../../common/paginate/paginate.interface';

@Injectable()
export class CafeteriaService {
    constructor(
        @InjectRepository(CafeteriaItemRepository)
        private cafeteriaItemRepository: CafeteriaItemRepository,
        private connection: Connection,
    ) {
    }

    /*
        INVENTORY
    */
    async getAllItems(options: PaginationOptionsInterface, q: string): Promise<Pagination> {
        const page = options.page - 1;

        const result = await this.cafeteriaItemRepository.find({
            take: options.limit,
            skip: (page * options.limit),
        });

        const count = await this.cafeteriaItemRepository.count();

        return {
            result,
            lastPage: Math.ceil(count / options.limit),
            itemsPerPage: options.limit,
            totalPages: count,
            currentPage: options.page,
        };
    }

    async createItem(itemDto: CafeteriaItemDto): Promise<CafeteriaItem> {
        const { name, price, description, quantity } = itemDto;

        return await this.cafeteriaItemRepository.save({
            name,
            price,
            quantity,
            description,
        });
    }

    async updateItem(id: string, itemDto: CafeteriaItemDto): Promise<CafeteriaItem> {
        const { name, price, description, quantity } = itemDto;

        const stock = await this.cafeteriaItemRepository.findOne(id);
        stock.name = name;
        stock.description = description;
        stock.price = price;
        stock.quantity = quantity;
        await stock.save();
        return stock;
    }

    async updateInventoryQty(param): Promise<CafeteriaItem> {
        const { id, quantity } = param;
        const inventory = await this.cafeteriaItemRepository.findOne(id);
        inventory.quantity = quantity;
        await inventory.save();
        return inventory;
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

            const transaction = new Transactions();
            transaction.bill_source = 'cafeteria';
            transaction.sub_total = sub_total;
            transaction.vat = vat;
            transaction.amount = total_amount;
            transaction.amount_paid = amount_paid;
            transaction.change = change * -1;
            transaction.payment_method = payment_method;
            transaction.transaction_type = 'debit';
            transaction.balance = 0;
            transaction.status = 1;
            transaction.createdBy = username;
            transaction.lastChangedBy = username;

            if (user_type === 'staff') {
                const staff = await this.connection.getRepository(StaffDetails)
                    .createQueryBuilder('s').where('s.id = :id', { id: user_id }).getOne();
                transaction.staff = staff;
            } else if (user_type === 'patient') {
                const patient = await this.connection.getRepository(Patient).findOne(user_id, { relations: ['hmo'] });
                transaction.patient = patient;
                transaction.hmo = patient.hmo;
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

            transaction.transaction_details = data;
            transaction.payment_type = ''; // HMO/self
            await transaction.save();

            return { success: true, transaction };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}
