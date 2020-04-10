import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CafeteriaInventoryRepository } from './repositories/cafeteria.inventory.repository';
import { CafeteriaInventoryCategoryRepository } from './repositories/cafeteria.inventory.category.repository';
import { CafeteriaItemCategoryRepository } from './repositories/cafeteria.item.category.repository';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaInventoryDto } from './dto/cafeteria.inventory.dto';
import { CafeteriaInventoryQtyDto } from './dto/cafeteria.inventory.qty.dto';
import { CafeteriaInventoryCategory } from './entities/cafeteria_inventory_category.entity';
import { CafeteriaInventoryCategoryDto } from './dto/cafeteria.inventory.category.dto';
import { CafeteriaItemCategory } from './entities/cafeteria_item_category.entity';
import { CafeteriaItemCategoryDto } from './dto/cafeteria.item.category.dto';
import { CafeteriaInventory } from './entities/cafeteria_inventory.entity';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { Transactions } from '../../finance/transactions/transaction.entity';
import { Connection, Like } from 'typeorm';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { Patient } from '../../patient/entities/patient.entity';

@Injectable()
export class CafeteriaService {
    constructor(
        @InjectRepository(CafeteriaInventoryRepository)
        private cafeteriaInventoryRepository: CafeteriaInventoryRepository,
        @InjectRepository(CafeteriaInventoryCategoryRepository)
        private cafeteriaInventoryCategoryRepository: CafeteriaInventoryCategoryRepository,
        @InjectRepository(CafeteriaItemCategoryRepository)
        private cafeteriaItemCategoryRepository: CafeteriaItemCategoryRepository,
        @InjectRepository(CafeteriaItemRepository)
        private cafeteriaItemRepository: CafeteriaItemRepository,
        private connection: Connection,
    ) {}

    /*
        INVENTORY
    */

    async getAllItems(urlParam): Promise<CafeteriaItem[]> {
        const {q} = urlParam;

        const query = this.cafeteriaItemRepository.createQueryBuilder('q');
                        // .relation(CafeteriaItemCategory, 'category');
        if (q && q !== '') {
            query.where('q.name LIKE  :query', {query: `%${q}%`});
        }
        return await query.getRawMany();
    }

    async findItem(urlParam): Promise<CafeteriaItem[]> {
        const {q} = urlParam;

        return await this.cafeteriaItemRepository.find({where: [
            {name: Like(`%${q}%`)},
        ]});
    }

    async getItemById(id): Promise<CafeteriaItem> {
        return await this.cafeteriaItemRepository.findOne(id);
    }

    async getItemsByCategory(category_id: string): Promise<CafeteriaItem[]> {
        const category = await this.cafeteriaItemCategoryRepository.findOne(category_id);
        return this.cafeteriaItemRepository.find({ where: {category}});
    }

    async createItem(itemDto: CafeteriaItemDto): Promise<CafeteriaItem> {
        const { category_id , name, price, discount_price, description, item_code } = itemDto;
        const category = await this.cafeteriaItemCategoryRepository.findOne(category_id);
        let code = item_code;
        if (item_code === '') {
            code = 'STU-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        }
        return await this.cafeteriaItemRepository.save({
            name,
            category,
            price,
            discount_price,
            description,
            item_code: code,
        });
    }

    async updateItem(id: string, itemDto: CafeteriaItemDto): Promise<CafeteriaItem> {
        const { category_id , name, price, discount_price, description, item_code } = itemDto;

        const category = await this.cafeteriaItemCategoryRepository.findOne(category_id);

        const stock = await this.cafeteriaItemRepository.findOne(id);
        stock.name        = name;
        stock.item_code   = (item_code !== '') ? item_code : 'STU-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        stock.description = description;
        stock.price       = price;
        stock.discount_price = discount_price;
        stock.category    = category;
        await stock.save();
        return stock;
    }

    async downloadStocks() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'cafeteria-items.csv',
            header: [
                {id: 'category', title: 'CATEGORY'},
                {id: 'item_code', title: 'ITEM CODE'},
                {id: 'name', title: 'NAME'},
                {id: 'price', title: 'SALES PRICE'},
                {id: 'discount_price', title: 'DISCOUNT PRICE'},
                {id: 'description', title: 'DESCRIPTION'},
            ],
        });

        try {
            const stocks = await this.cafeteriaItemRepository.find({relations: ['category']});

            if (stocks.length) {
                for (const stock of stocks) {
                    const data = [
                        {
                            category: (stock.category) ? stock.category.name : '',
                            item_code: stock.item_code,
                            name: stock.name,
                            price: stock.price,
                            discount_price: stock.discount_price,
                            description: stock.description,
                        },
                    ];

                    await csvWriter.writeRecords(data);
                }
            } else {
                const data = [
                    {
                        category: '',
                        item_code: '',
                        name: '',
                        price: '',
                        discount_price: '',
                        description: '',
                    },
                ];
                await csvWriter.writeRecords({data});

            }
            return {success: true};
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async updateInventoryQty(param: CafeteriaInventoryQtyDto): Promise<CafeteriaInventory> {
        const { id, quantity } = param;
        const inventory = await this.cafeteriaInventoryRepository.findOne(id);
        inventory.quantity    = quantity;
        await inventory.save();
        return inventory;
    }

    async deleteItem(id: string): Promise<void> {
        const result = await this.cafeteriaItemRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Item with ID '${id}' not found`);
        }
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
                    category: row.CATEGORY,
                    name: row.NAME,
                    price: row['SALES PRICE'].replace(',', ''),
                    discount_price: row['DISCOUNT PRICE'],
                    item_code: row['ITEM CODE'],
                    description: row.DESCRIPTION,
                };
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    let category;
                    // check if category exists
                    if (item.category !== '') {
                        category = await this.cafeteriaItemCategoryRepository.findOne({
                            where: {name: item.category},
                        });
                        if (!category) {
                            category = await this.cafeteriaItemCategoryRepository.save({name: item.category});
                        }
                    }
                    if (category) {
                        if (item.name !== '') {
                            await this.cafeteriaItemRepository.save({
                                name: item.name,
                                category,
                                price: item.price,
                                discount_price: item.discount_price,
                                description: item.description,
                                // tslint:disable-next-line:max-line-length
                                item_code: (item.item_code !== '') ? item.item_code : 'STU-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                            });
                        }
                    }
                }
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    /*
        INVENTORY
    */

    async getAllInventories(): Promise<CafeteriaInventory[]> {
        return await this.cafeteriaInventoryRepository.find({relations: ['category']});
    }

    async getInventoryByCategory(category_id: string): Promise<CafeteriaInventory[]> {
        const category = await this.cafeteriaInventoryCategoryRepository.findOne(category_id);
        return this.cafeteriaInventoryRepository.find({ where: {category}});
    }

    async createInventory(itemDto: CafeteriaInventoryDto): Promise<CafeteriaInventory> {
        const { category_id , name, cost_price, description, stock_code, quantity } = itemDto;
        const category = await this.cafeteriaInventoryCategoryRepository.findOne(category_id);
        let code = stock_code;
        if (stock_code === '') {
            code = 'STU-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        }
        return await this.cafeteriaInventoryRepository.save({
            name,
            category,
            cost_price,
            quantity,
            description,
            stock_code: code,
        });
    }

    async updateInventory(id: string, itemDto: CafeteriaInventoryDto): Promise<CafeteriaInventory> {
        const { category_id , name, cost_price, description, stock_code, quantity } = itemDto;

        const category = await this.cafeteriaInventoryCategoryRepository.findOne(category_id);

        const inventory = await this.cafeteriaInventoryRepository.findOne(id);
        inventory.name          = name;
        inventory.stock_code    = (stock_code !== '') ? stock_code : 'STU-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        inventory.description   = description;
        inventory.cost_price    = cost_price;
        inventory.quantity      = quantity;
        inventory.category      = category;
        await inventory.save();
        return inventory;
    }

    async deleteInventory(id: string): Promise<void> {
        const result = await this.cafeteriaInventoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Inventory with ID '${id}' not found`);
        }
    }

    /*
        INVENTORY CATEGORY
    */

    async getInventoryCategories(): Promise<CafeteriaInventoryCategory[]> {
        return await this.cafeteriaInventoryCategoryRepository.find();
    }

    async createInventoryCategory(params: CafeteriaInventoryCategoryDto): Promise<CafeteriaInventoryCategory> {
        return await this.cafeteriaInventoryCategoryRepository.save({name: params.name});
    }

    async updateInventoryCategory(id: string, param: CafeteriaInventoryCategoryDto): Promise<CafeteriaInventoryCategory> {
        const { name } = param;
        const category = await this.cafeteriaInventoryCategoryRepository.findOne(id);
        category.name = name;
        await category.save();
        return category;
    }

    async deleteInventoryCategory(id: string): Promise<void> {
        const result = await this.cafeteriaInventoryCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Inventory category with ID '${id}' not found`);
        }
    }

    /*
        ITEM CATEGORY
    */

    async getItemCategories(): Promise<CafeteriaItemCategory[]> {
        return await this.cafeteriaItemCategoryRepository.find();
    }

    async createItemCategory(param: CafeteriaItemCategoryDto): Promise<CafeteriaItemCategory> {
        const { name } = param;

        return await this.cafeteriaItemCategoryRepository.save({name});
    }

    async updateItemCategory(id: string, param: CafeteriaItemCategoryDto): Promise<CafeteriaItemCategory> {
        const { name } = param;
        const category = await this.cafeteriaItemCategoryRepository.findOne(id);
        category.name = name;
        await category.save();
        return category;
    }

    async deleteItemCategory(id: string): Promise<void> {
        const result = await this.cafeteriaItemCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Cafeteria item category with ID '${id}' not found`);
        }
    }

    async saveSales(param: CafeteriaSalesDto): Promise<any> {
        const { user_type, user_id, amount, amount_paid, payment_type, items } = param;
        try {
            const transaction = new Transactions();
            transaction.transaction_type  = 'cafeteria';
            transaction.amount            = amount;
            transaction.amount_paid       = amount_paid;
            transaction.payment_type      = payment_type;
            transaction.status            = 1;

            if (user_type === 'staff') {
                const staff = await this.connection.getRepository(StaffDetails)
                                        .createQueryBuilder('s').where('s.id = :id', {id: user_id}).getOne();
                transaction.staff = staff;
            } else if (user_type === 'patient') {
                const patient = await this.connection.getRepository(Patient)
                                        .createQueryBuilder('s').where('s.id = :id', {id: user_id}).getOne();
                transaction.patient = patient;
            }
            const data = [];
            for (const sale of items) {
                const parentItem = await this.cafeteriaItemRepository.findOne(sale.item_id);
                data.push({name: parentItem.name, amount});
            }
            transaction.transaction_details = data;
            await transaction.save();
            return {success: true, transaction};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }
}
