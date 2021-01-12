import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HmoRepository } from './hmo.repository';
import { Hmo } from './entities/hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { HmoUploadRateDto } from './dto/hmo.upload-rate.dto';
import { ServiceRepository } from '../settings/services/service.repository';
import { StockRepository } from '../inventory/stock.repository';
import { HmoRate } from './entities/hmo-rate.entity';
import { HmoRateRepository } from './hmo-rate.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import * as moment from 'moment';
import { Transactions } from '../finance/transactions/transaction.entity';
import { Patient } from '../patient/entities/patient.entity';
import { getConnection, Like } from 'typeorm';
import { Appointment } from '../frontdesk/appointment/appointment.entity';
import { QueueSystemRepository } from '../frontdesk/queue-system/queue-system.repository';
import { PaginationOptionsInterface } from '../../common/paginate';
import { AppGateway } from '../../app.gateway';

@Injectable()
export class HmoService {
    constructor(
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
        @InjectRepository(HmoRateRepository)
        private hmoRateRepository: HmoRateRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(StockRepository)
        private stockRepository: StockRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        private readonly appGateway: AppGateway,
    ) {}

    async getHmos(urlParams): Promise<Hmo[]> {
        const { name } = urlParams;
        let searchParam = {};
        if (name && name !== '') {
            searchParam = {
                where: {
                    name: Like(`%${name}%`),
                },
            };
        }

        return this.hmoRepository.find(searchParam);
    }

    async getHmoTariff(id, urlParams): Promise<HmoRate[]> {
        const {listType } = urlParams;
        if  (listType === 'services') {
            return await this.hmoRateRepository.createQueryBuilder('q')
                .leftJoinAndSelect('q.service', 'service')
                .select('q.rate, q.percentage, service.tariff, service.name, service.discount')
                .where('q.hmo_id = :id', {id}).getRawMany();
        } else {
            return await this.hmoRateRepository.createQueryBuilder('q')
                .leftJoinAndSelect('q.stock', 'stock')
                .select('q.rate, q.percentage, stock.sales_price as tariff, stock.name')
                .where('q.hmo_id = :id', {id}).getRawMany();
        }
    }

    async createHmo(hmoDto: HmoDto): Promise<Hmo> {
        return this.hmoRepository.saveHmo(hmoDto);
    }

    async updateHmo(id: string, hmoDto: HmoDto): Promise<any> {
        const { name, address, phoneNumber, email }  = hmoDto;
        const hmo = await this.hmoRepository.findOne(id);
        if (!hmo) {
            return { success: false, message: `HMO with ${id} was not found`};
        }
        hmo.name        = name.toLocaleLowerCase();
        // hmo.logo        = logo;
        hmo.address     = address;
        hmo.phoneNumber = phoneNumber;
        hmo.email       = email;
        await hmo.save();
        return hmo;
    }

    async deleteHmo(id: string): Promise<void> {
        // delete hmo rates
        await this.hmoRateRepository
            .createQueryBuilder()
            .delete()
            .where('hmo_id = :id', { id })
            .execute();
        // delete hmo
        const result = await this.hmoRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`HMO with ID '${id}' not found`);
        }
    }

    async downloadHmoRate(query) {
        const {downloadType} = query;
        if (downloadType === 'services') {
            return this.downloadHmoServices();
        } else {
            return this.downloadHmoStocks();
        }
    }

    private async downloadHmoServices() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'hmo-rate-sample.csv',
            header: [
                {id: 'category', title: 'CATEGORY'},
                {id: 'sub_category', title: 'SUB CATEGORY'},
                {id: 'slug', title: 'SLUG'},
                {id: 'name', title: 'SERVICE'},
                {id: 'amount', title: 'TARIFF'},
                {id: 'hmo_rate', title: 'HMO TARIFF'},
                {id: 'comment', title: 'COMMENT'},
                {id: 'percentage', title: 'PERCENTAGE'},
            ],
        });

        const services = await this.serviceRepository.find({relations: ['subCategory', 'category', 'hmo']});

        if (services.length) {
            for (const service of services) {
                const data = [
                    {
                        category: service.category.name,
                        sub_category: (service.subCategory) ? service.subCategory.name : '',
                        slug: service.slug,
                        name: service.name,
                        amount: service.tariff,
                        hmo_rate: '',
                        comment: '',
                        percentage: '',
                    },
                ];

                await csvWriter.writeRecords(data);
            }
        } else {
            const data = [
                {
                    category: '',
                    sub_category: '',
                    slug: '',
                    name: '',
                    amount: '',
                    hmo_rate: '',
                    comment: '',
                    percentage: '',
                },
            ];
            await csvWriter.writeRecords(data);
        }
        return 'Completed';
    }

    private async downloadHmoStocks() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'hmo-rate-sample.csv',
            header: [
                {id: 'category', title: 'DRUG CLASS'},
                {id: 'stock_code', title: 'STOCK CODE'},
                {id: 'name', title: 'BRAND NAME'},
                {id: 'generic_name', title: 'GENERIC NAME'},
                {id: 'quantity', title: 'QUANTITY ON HAND'},
                {id: 'sales_price', title: 'SALES PRICE'},
                {id: 'hmo_rate', title: 'HMO TARIFF'},
                {id: 'percentage', title: 'PERCENTAGE'},
                {id: 'comment', title: 'COMMENT'},
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
                            generic_name: '',
                            quantity: stock.quantity,
                            sales_price: stock.sales_price,
                            hmo_rate: '',
                            comment: '',
                            percentage: '',
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
                        hmo_rate: '',
                        comment: '',
                        percentage: '',
                    },
                ];
                await csvWriter.writeRecords({data});

            }
            return {success: true};
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async doUploadRate(uploadRateDto: HmoUploadRateDto, file: any) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const { hmo_id, uploadType } = uploadRateDto;
        // find category
        const hmo = await this.hmoRepository.findOne(hmo_id);
        const content = [];
        try {
            // read uploaded file
            fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', async (row) => {
                const data = {
                    code: row.CODE,
                    hmo_rate: row['HMO TARIFF'],
                    percentage: row.PERCENTAGE,
                    comment: row.COMMENT,
                };
                content.push(data);
            })
            .on('end', async () => {
                await this.hmoRateRepository.delete({});
                for (const item of content) {
                    let service;
                    let stock;
                    if (uploadType === 'services') {
                        service = await this.serviceRepository.findOne({ where: {slug: item.slug}});
                    } else {
                        stock = await this.stockRepository.findOne({ where: {stock_code: item.code }});
                    }
                    const hmoRate       = new HmoRate();
                    hmoRate.hom         = hmo;
                    hmoRate.service     = service;
                    hmoRate.stock       = stock;
                    hmoRate.rate        = item.hmo_rate;
                    hmoRate.percentage  = item.percentage;
                    hmoRate.comment     = item.comment;
                    await hmoRate.save();
                }
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async fetchTransactions(options: PaginationOptionsInterface, params): Promise<Transactions[]> {
        const {startDate, endDate, patient_id, hmo_id, status, page, limit } = params;

        const query = this.transactionsRepository.createQueryBuilder('q')
                            .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                            .leftJoin(Hmo, 'hmo', `"patient"."hmo_id" = "hmo"."id"`)
                            .where('q.payment_type = :type', {type: 'HMO'})
                            .select('q.*')
                            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.fileNumber, hmo.name as hmo_name, hmo.id as hmo_id');

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (hmo_id && hmo_id !== '') {
            query.andWhere('hmo.id = :hmo_id', {hmo_id});
        }
        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', {patient_id});
        }

        if (status) {
            query.andWhere('q.status = :status', {status});
        }

        const transactions = await query.take(options.limit).skip((options.page === 1) ? options.page : options.page * options.limit).getRawMany();

        return transactions;
    }

    async fetchPendingTransactions(options: PaginationOptionsInterface, params): Promise<Transactions[]> {
        const {startDate, endDate, hmo_id } = params;

        const query = this.transactionsRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .leftJoin(Hmo, 'hmo', `"patient"."hmo_id" = "hmo"."id"`)
                        .where('q.payment_type = :type', {type: 'HMO'})
                        .andWhere('q.hmo_approval_status = :status', {status: 0})
                        .select('q.*')
                        .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.fileNumber, hmo.name as hmo_name, hmo.id as hmo_id');

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (hmo_id && hmo_id !== '') {
            query.andWhere('hmo.id = :hmo_id', {hmo_id});
        }

        const transactions = await query.take(options.limit).skip((options.page === 1) ? options.page : options.page * options.limit).getRawMany();

        return transactions;
    }

    async processTransaction(params, {userId}) {
        const { action, id, approvalCode } = params;
        try {

            const transaction = await this.transactionsRepository.findOne(id, {relations: ['patient']});
            if (!transaction) {
                throw new NotFoundException(`Transaction was not found`);
            }
            if (action === '1') {
                transaction.hmo_approval_status = 2;
                transaction.hmo_approval_code = approvalCode;
            } else {
                transaction.hmo_approval_status = 3;
            }
            await transaction.save();
            // find appointment
            const appointment = await getConnection().getRepository(Appointment).findOne({
                where: {patient: transaction.patient, status: 'Pending HMO Approval'},
                relations: ['patient'],
            });
            let queue = {};
            if (appointment) {
                appointment.status = 'Pending Paypoint Approval';
                appointment.save();
                // create new queue
                queue = await this.queueSystemRepository.saveQueue(appointment, 'vitals');
            }
            this.appGateway.server.emit('paypoint-queue', {queue});

            return {success: true, transaction, queue};
        } catch (error) {
            return {success: false, message: error.message};
        }

    }
}
