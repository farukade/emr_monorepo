import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { CafeteriaInventoryRepository } from './cafeteria.repository';
import { Raw } from 'typeorm';
import { InventoryDto } from '../dto/inventory.dto';
import { formatPID } from '../../../common/utils/utils';
import { InventoryActivityRepository } from '../activity/activity.repository';
import { CafeteriaInventory } from '../entities/cafeteria_inventory.entity';
import { InventoryPurchase } from '../entities/purchase.entity';
import { VendorRepository } from '../vendor/vendor.repository';
import { Vendor } from '../entities/vendor.entity';

@Injectable()
export class CafeteriaInventoryService {
    constructor(
        @InjectRepository(CafeteriaInventoryRepository)
        private cafeteriaInventoryRepository: CafeteriaInventoryRepository,
        @InjectRepository(InventoryActivityRepository)
        private inventoryActivityRepository: InventoryActivityRepository,
        @InjectRepository(VendorRepository)
        private vendorRepository: VendorRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.cafeteriaInventoryRepository.findAndCount({
                where: {
                    name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
                },
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.cafeteriaInventoryRepository.findAndCount({
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
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

    async createItem(inventoryDto: InventoryDto, username: string): Promise<any> {
        try {
            const { name, unitOfMeasure } = inventoryDto;

            const lastItem = await this.cafeteriaInventoryRepository.findOne({
                order: { code: 'DESC' },
            });

            let alphaCode;
            let code;
            if (lastItem) {
                alphaCode = lastItem.code.substring(0, 2);
                const num = lastItem.code.slice(2);
                const index = parseInt(num, 10) + 1;
                code = `${alphaCode.toLocaleUpperCase()}${formatPID(index, lastItem.code.length - 2)}`;
            } else {
                code = `ST${formatPID(1)}`;
            }

            const item = new CafeteriaInventory();
            item.name = name;
            item.code = code;
            item.quantity = 0;
            item.unitOfMeasure = unitOfMeasure;
            item.unitPrice = 0;
            item.createdBy = username;
            const rs = await item.save();

            return { success: true, item: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error could not save item' };
        }
    }

    async updateItem(id: string, inventoryDto: InventoryDto, username: string): Promise<any> {
        try {
            const { name, unitOfMeasure } = inventoryDto;

            const item = await this.cafeteriaInventoryRepository.findOne(id);
            item.name = name;
            item.unitOfMeasure = unitOfMeasure;
            item.lastChangedBy = username;
            const rs = await item.save();

            return { success: true, item: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error could not save item' };
        }
    }

    async updateQty(id, inventoryDto: InventoryDto, username: string): Promise<any> {
        try {
            const { quantity, unit_price, vendor_id, vendor_label } = inventoryDto;

            const item = await this.cafeteriaInventoryRepository.findOne(id);
            item.quantity = item.quantity + parseInt(quantity, 10);
            item.unitPrice = unit_price;
            item.lastChangedBy = username;
            const rs = await item.save();

            await this.inventoryActivityRepository.saveActivity(
                { cafeteria: rs, quantity, unitPrice: item.unitPrice },
                username,
            );

            let vendor;
            if (vendor_id === '') {
                const vItem = new Vendor();
                vItem.name = vendor_label;
                vendor = await vItem.save();
            } else {
                vendor = await this.vendorRepository.findOne(vendor_id);
            }

            const purchase = new InventoryPurchase();
            purchase.quantity = quantity;
            purchase.purchase_price = unit_price;
            purchase.vendor = vendor;
            purchase.item_id = item.id;
            purchase.item_category = 'cafeteria';
            await purchase.save();

            return { success: true, item: rs };
        } catch (e) {
            return { success: false, message: 'error could not update quantity' };
        }
    }
}
