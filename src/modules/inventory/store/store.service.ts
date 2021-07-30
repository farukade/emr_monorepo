import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreInventoryRepository } from './store.repository';
import { Raw } from 'typeorm';
import { formatPID } from '../../../common/utils/utils';
import { InventoryDto } from '../dto/inventory.dto';
import { StoreInventory } from '../entities/store_inventory.entity';
import { InventoryActivityRepository } from '../activity/activity.repository';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(StoreInventoryRepository)
        private storeInventoryRepository: StoreInventoryRepository,
        @InjectRepository(InventoryActivityRepository)
        private inventoryActivityRepository: InventoryActivityRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.storeInventoryRepository.findAndCount({
                where: {
                    name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
                },
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.storeInventoryRepository.findAndCount({
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
            const { name, quantity, unitPrice, unitOfMeasure } = inventoryDto;

            const lastItem = await this.storeInventoryRepository.findOne({
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

            const store = new StoreInventory();
            store.name = name;
            store.code = code;
            store.quantity = quantity;
            store.unitOfMeasure = unitOfMeasure;
            store.unitPrice = unitPrice;
            const rs = await store.save();

            await this.inventoryActivityRepository.saveActivity(
                { store: rs, quantity, unitPrice },
                username,
            );

            return { success: true, item: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error could not save item' };
        }
    }

    async updateItem(id: string, inventoryDto: InventoryDto, username: string): Promise<any> {
        try {
            const { name, unitPrice, unitOfMeasure } = inventoryDto;

            const store = await this.storeInventoryRepository.findOne(id);
            store.name = name;
            store.unitPrice = unitPrice;
            store.unitOfMeasure = unitOfMeasure;
            store.lastChangedBy = username;
            const rs = await store.save();

            await this.inventoryActivityRepository.saveActivity(
                { store: rs, quantity: 0, unitPrice },
                username,
            );

            return { success: true, item: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error could not save item' };
        }
    }

    async updateQty(id, inventoryDto: InventoryDto, username: string): Promise<any> {
        try {
            const { quantity } = inventoryDto;

            const item = await this.storeInventoryRepository.findOne(id);
            item.quantity = item.quantity + parseInt(quantity, 10);
            item.lastChangedBy = username;
            const rs = await item.save();

            await this.inventoryActivityRepository.saveActivity(
                { store: rs, quantity, unitPrice: item.unitPrice },
                username,
            );

            return { success: true, item: rs };
        } catch (e) {
            return { success: false, message: 'error could not update quantity' };
        }
    }
}
