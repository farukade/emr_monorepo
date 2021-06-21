import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { Transactions } from '../../finance/transactions/transaction.entity';
import { Connection } from 'typeorm';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';

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

    async downloadStocks() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'cafeteria-items.csv',
            header: [
                { id: 'category', title: 'CATEGORY' },
                { id: 'item_code', title: 'ITEM CODE' },
                { id: 'name', title: 'NAME' },
                { id: 'price', title: 'SALES PRICE' },
                { id: 'discount_price', title: 'DISCOUNT PRICE' },
                { id: 'description', title: 'DESCRIPTION' },
            ],
        });

        try {
            const stocks = await this.cafeteriaItemRepository.find({ relations: ['category'] });

            if (stocks.length) {
                for (const stock of stocks) {
                    const data = [
                        {
                            name: stock.name,
                            price: stock.price,
                            description: stock.description,
                            quantity: stock.quantity,
                        },
                    ];

                    await csvWriter.writeRecords(data);
                }
            } else {
                const data = [
                    {
                        name: '',
                        price: '',
                        description: '',
                        quantity: '',
                    },
                ];
                await csvWriter.writeRecords({ data });

            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
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

    async doUploadItem(file: any) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const content = [];

        try {
            // read uploaded file
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', async (row) => {
                    const data = {
                        name: row.NAME,
                        price: row['SALES PRICE'].replace(',', ''),
                        description: row.DESCRIPTION,
                        quantity: row.QUANTITY,
                    };
                    content.push(data);
                })
                .on('end', async () => {
                    for (const item of content) {
                        if (item.name !== '') {
                            await this.cafeteriaItemRepository.save({
                                name: item.name,
                                price: item.price,
                                description: item.description,
                                quantity: item.quantity,
                            });
                        }
                    }
                });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async saveSales(param: CafeteriaSalesDto): Promise<any> {
        const { user_type, user_id, sub_total, vat, total_amount, amount_paid, balance, payment_type, items } = param;
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
            transaction.transaction_type = 'cafeteria';
            transaction.sub_total = sub_total;
            transaction.vat = vat;
            transaction.amount = total_amount;
            transaction.amount_paid = amount_paid;
            transaction.balance = balance * -1;
            transaction.payment_type = payment_type;
            transaction.status = 1;

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
            await transaction.save();

            return { success: true, transaction };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}
