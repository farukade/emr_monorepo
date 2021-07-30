import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { RequisitionRepository } from './requisition.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { Requisition } from '../entities/requisition.entity';
import { StoreInventoryRepository } from '../store/store.repository';
import { CafeteriaInventoryRepository } from '../cafeteria/cafeteria.repository';
import { RequisitionDto } from '../dto/requisition.dto';
import * as moment from 'moment';
import { Brackets } from 'typeorm';

@Injectable()
export class RequisitionService {
    constructor(
        @InjectRepository(RequisitionRepository)
        private requisitionRepository: RequisitionRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(StoreInventoryRepository)
        private storeInventoryRepository: StoreInventoryRepository,
        @InjectRepository(CafeteriaInventoryRepository)
        private cafeteriaInventoryRepository: CafeteriaInventoryRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, staff_id, status, category } = params;

        const page = options.page - 1;

        const query = this.requisitionRepository.createQueryBuilder('r').select('r.*');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`r.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`r.createdAt <= '${end}'`);
        }

        if (status && status !== '') {
            if (status === 'pending') {
                query.andWhere('r.approved = :status', { status: 0 })
                    .andWhere('r.declined = :status', { status: 0 });
            } else if (status === 'approved') {
                query.andWhere('r.approved = :status', { status: 1 });
            } else if (status === 'declined') {
                query.andWhere('r.declined = :status', { status: 1 });
            }
        }

        if (staff_id && staff_id !== '') {
            query.andWhere('r.staff_id = :staff_id', { staff_id });
        }

        if (category && category !== '') {
            query.andWhere('r.category = :category', { category });
        }

        const requisitions = await query.withDeleted().offset(page * options.limit)
            .limit(options.limit)
            .orderBy('r.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        let result = [];
        for (const item of requisitions) {

            if (item.store_inventory_id) {
                item.store = await this.storeInventoryRepository.findOne(item.store_inventory_id);
            }

            if (item.cafeteria_inventory_id) {
                item.cafeteria = await this.cafeteriaInventoryRepository.findOne(item.cafeteria_inventory_id);
            }

            item.staff = await this.staffRepository.findOne(item.staff_id);

            result = [...result, item];
        }

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async create(requisitionDto: RequisitionDto, username: string): Promise<any> {
        try {
            const { staff_id, category, item_id, quantity } = requisitionDto;

            console.log(staff_id);
            const staff = await this.staffRepository.findOne(staff_id);
            console.log(staff);

            const item = new Requisition();
            item.staff = staff;
            if (category === 'store') {
                item.store = await this.storeInventoryRepository.findOne(item_id);
            } else if (category === 'cafeteria') {
                item.cafeteria = await this.cafeteriaInventoryRepository.findOne(item_id);
            }
            item.category = category;
            item.quantity = quantity;
            item.createdBy = username;
            const rs = await item.save();

            return { success: true, item: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error could not save request' };
        }
    }

    async updateItem(id: string, requisitionDto: RequisitionDto, username: string): Promise<any> {
        try {
            const { category, item_id, quantity } = requisitionDto;

            const item = await this.requisitionRepository.findOne(id);
            if (category === 'store') {
                item.store = await this.storeInventoryRepository.findOne(item_id);
            } else if (category === 'cafeteria') {
                item.cafeteria = await this.cafeteriaInventoryRepository.findOne(item_id);
            }
            item.category = category;
            item.quantity = quantity;
            item.lastChangedBy = username;
            const rs = await item.save();

            return { success: true, item: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error could not save request' };
        }
    }

    async approve(id, username: string): Promise<any> {
        try {
            const item = await this.requisitionRepository.findOne(id, { relations: ['store', 'cafeteria'] });
            item.approved = 1;
            item.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            item.approvedBy = username;
            const rs = await item.save();

            if (item.category === 'store') {
                const store = await this.storeInventoryRepository.findOne(item.store.id);
                store.quantity = store.quantity - item.quantity;
                await store.save();
            } else if (item.category === 'cafeteria') {
                const cafeteria = await this.cafeteriaInventoryRepository.findOne(item.cafeteria.id);
                cafeteria.quantity = cafeteria.quantity - item.quantity;
                await cafeteria.save();
            }

            return { success: true, item: rs };
        } catch (e) {
            return { success: false, message: 'error could not approve request' };
        }
    }

    async decline(id, param, username: string): Promise<any> {
        try {
            const item = await this.requisitionRepository.findOne(id);
            item.declined = 1;
            item.declinedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            item.declinedBy = username;
            item.declineReason = param.reason;
            const rs = await item.save();

            return { success: true, item: rs };
        } catch (e) {
            return { success: false, message: 'error could not decline request' };
        }
    }

    async deleteRequest(id: number, username: string) {
        const requisition = await this.requisitionRepository.findOne(id);

        if (!requisition) {
            throw new NotFoundException(`Requisition with ID '${id}' not found`);
        }

        requisition.deletedBy = username;
        const rs = await requisition.save();

        return await rs.softRemove();
    }
}
