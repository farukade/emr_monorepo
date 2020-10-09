import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryCategoryRepository } from './inventory.category.repository';
import { InventoryCategory } from './entities/inventory.category.entity';
import { InventoryCategoryDto } from './dto/inventory.category.dto';
import { InventorySubCategoryDto } from './dto/inventory.sub-category.dto';
import { InventorySubCategory } from './entities/inventory.sub-category.entity';
import { InventorySubCategoryRepository } from './inventory.sub-category.repository';
import { StockDto } from './dto/stock.dto';
import { StockRepository } from './stock.repository';
import { Stock } from './entities/stock.entity';
import { StockQtyDto } from './dto/stock.qty.dto';
import { StockUploadDto } from './dto/stock.upload.dto';
import { PaginationOptionsInterface } from '../../common/paginate';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(InventoryCategoryRepository)
        private inventoryCategoryRepository: InventoryCategoryRepository,
        @InjectRepository(InventorySubCategoryRepository)
        private inventorySubCategoryRepository: InventorySubCategoryRepository,
        @InjectRepository(StockRepository)
        private stockRepository: StockRepository,
    ) {}

    /*
        INVENTORY
    */

    async getAllStocks(options: PaginationOptionsInterface): Promise<Stock[]> {
        return await this.stockRepository.find({
            relations: ['subCategory', 'category'],
            take: options.limit,
            skip: (options.page * options.limit)
        });
    }

    async getStockById(id): Promise<Stock> {
        return await this.stockRepository.findOne(id);
    }

    async getStocksByCategoryId(category_id: string): Promise<Stock[]> {
        // find category
        const category = await this.inventoryCategoryRepository.findOne(category_id);

        return this.stockRepository.find({where: {category}});
    }

    async getStocksByCategoryName(name: string): Promise<Stock[]> {
        // find sub category
        const subCategory = await this.inventorySubCategoryRepository.findOne({where: {name}});

        return this.stockRepository.find({where: {subCategory}});
    }

    async getStocksBySubCategory(sub_category_id: string): Promise<Stock[]> {
        const subCategory = await this.inventorySubCategoryRepository.findOne(sub_category_id);
        return this.stockRepository.find({ where: {subCategory}});
    }

    async createStock(stockDto: StockDto): Promise<Stock> {
        const { category_id, sub_category_id } = stockDto;
        const category = await this.inventoryCategoryRepository.findOne(category_id);
        let subCategory;
        if (sub_category_id) {
            subCategory = await this.inventorySubCategoryRepository.findOne(sub_category_id);
        }
        return this.stockRepository.saveStock(stockDto, category, subCategory);
    }

    async updateStock(id: string, stockDto: StockDto): Promise<Stock> {
        const { name, description, stock_code, cost_price, sales_price, quantity, category_id, sub_category_id } = stockDto;
        const category = await this.inventoryCategoryRepository.findOne(category_id);
        const subCategory = await this.inventorySubCategoryRepository.findOne(sub_category_id);
        const stock = await this.stockRepository.findOne(id);
        stock.name        = name;
        stock.stock_code  = (stock_code !== '') ? 'STU-' + stock_code : 'STU-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        stock.description = description;
        stock.cost_price  = cost_price;
        stock.sales_price = sales_price;
        stock.quantity    = quantity;
        stock.subCategory = subCategory;
        stock.category    = category;
        await stock.save();
        return stock;
    }

    async downloadStocks() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'stocks.csv',
            header: [
                {id: 'category', title: 'DRUG CLASS'},
                {id: 'stock_code', title: 'STOCK CODE'},
                {id: 'name', title: 'BRAND NAME'},
                {id: 'generic_name', title: 'GENERIC NAME'},
                {id: 'quantity', title: 'QUANTITY ON HAND'},
                {id: 'sales_price', title: 'SALES PRICE'},
            ],
        });

        try {
            const stocks = await this.stockRepository.find({relations: ['subCategory']});

            if (stocks.length) {
                for (const stock of stocks) {
                    const data = [
                        {
                            category: (stock.subCategory) ? stock.subCategory.name : '',
                            code: stock.stock_code,
                            name: stock.name,
                            generic_name: stock.generic_name,
                            quantity: stock.quantity,
                            sales_price: stock.sales_price,
                        },
                    ];

                    await csvWriter.writeRecords(data);
                }
            } else {
                const data = [
                    {
                        category: '',
                        code: '',
                        name: '',
                        generic_name: '',
                        quantity: '',
                        sales_price: '',
                    },
                ];
                await csvWriter.writeRecords({data});

            }
            return {success: true};
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async updateStockQty(stockQtyDto: StockQtyDto): Promise<Stock> {
        const { id, quantity } = stockQtyDto;
        const stock = await this.stockRepository.findOne(id);
        stock.quantity    = quantity;
        await stock.save();
        return stock;
    }

    async deleteStock(id: string): Promise<void> {
        const result = await this.stockRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Stock with ID '${id}' not found`);
        }
    }

    async doUploadStock(stockUploadDto: StockUploadDto, file: any) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const { category_id } = stockUploadDto;
        const content = [];
        // find category
        const category = await this.inventoryCategoryRepository.findOne(category_id);
        let subCategory;
        try {
            // read uploaded file
            fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', async (row) => {
                const data = {
                    category: row['DRUG CLASS'],
                    name: row['BRAND NAME'],
                    generic_name: row['GENERIC NAME'],
                    quantity: row['QUANTITY ON HAND'],
                    sales_price: row['SALES PRICE'],
                    stock_code: 'STU-' + (Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)).toUpperCase(),
                };
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    // check if sub category exists
                    if (item.category && item.category !== '') {
                        subCategory = await this.inventorySubCategoryRepository.findOne({
                            where: {name: item.category},
                        });
                        if (!subCategory) {
                            subCategory = await this.inventorySubCategoryRepository.save({name: item.category, category});
                        }
                    }

                    if (item.name && item.name !== '') {
                        // check if name exist
                        const stock = await this.stockRepository.findOne({where: {name: item.name}});
                        if (!stock) {
                            item.subCategory = subCategory;
                            item.category = category;
                            // save stock
                            await this.stockRepository.save(item);
                            console.log('new stock');
                        } else {
                            stock.name = item.name;
                            stock.generic_name = item.generic_name;
                            stock.sales_price = item.sales_price.replace(',', '');
                            stock.quantity = item.quantity;
                            stock.category = category;
                            stock.subCategory = subCategory;
                            await stock.save();
                            console.log('update stock');
                        }
                    }
                }
                console.log(content);
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    /*
        INVENTORY CATEGORY
    */

    async getCategories(): Promise<InventoryCategory[]> {
        return this.inventoryCategoryRepository.find();
    }

    async createCategory(inventoryCategoryDto: InventoryCategoryDto): Promise<InventoryCategory> {
        return this.inventoryCategoryRepository.saveCategory(inventoryCategoryDto);
    }

    async updateCategory(id: string, inventoryCategoryDto: InventoryCategoryDto): Promise<InventoryCategory> {
        const { name } = inventoryCategoryDto;
        const category = await this.inventoryCategoryRepository.findOne(id);
        category.name = name;
        await category.save();
        return category;
    }

    async deleteCategory(id: string): Promise<void> {
        const result = await this.inventoryCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Inventory category with ID '${id}' not found`);
        }
    }

    /*
        INVENTORY SUB CATEGORY
    */

    getAllSubCategories(): Promise<InventorySubCategory[]> {
        return this.inventorySubCategoryRepository.find({relations: ['category']});
    }

    async getSubCategories(categoryID: string): Promise<InventorySubCategory[]> {
        return this.inventorySubCategoryRepository.find({where: {inventory_category_id: categoryID}});
    }

    async createSubCategory(inventorySubCategoryDto: InventorySubCategoryDto): Promise<InventorySubCategory> {
        const { inventory_category_id } = inventorySubCategoryDto;
        const category = await this.inventoryCategoryRepository.findOne(inventory_category_id);

        return this.inventorySubCategoryRepository.saveCategory(inventorySubCategoryDto, category);
    }

    async updateSubCategory(id: string, inventorySubCategoryDto: InventorySubCategoryDto): Promise<InventoryCategory> {
        const { name, inventory_category_id } = inventorySubCategoryDto;
        const category = await this.inventoryCategoryRepository.findOne(inventory_category_id);
        const subCategory = await this.inventorySubCategoryRepository.findOne(id);
        subCategory.name = name;
        subCategory.category = category;
        await subCategory.save();
        return subCategory;
    }

    async deleteSubCategory(id: string): Promise<void> {
        const result = await this.inventorySubCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Inventory sub category with ID '${id}' not found`);
        }
    }
}
