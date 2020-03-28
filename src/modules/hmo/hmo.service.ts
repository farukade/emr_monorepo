import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HmoRepository } from './hmo.repository';
import { Hmo } from './hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { HmoUploadRateDto } from './dto/hmo.upload-rate.dto';
import { ServiceRepository } from '../settings/services/service.repository';
import { StockRepository } from '../inventory/stock.repository';
import { HmoRate } from './hmo-rate.entity';
import { HmoRateRepository } from './hmo-rate.repository';

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
    ) {}

    async getHmos(): Promise<Hmo[]> {
        return this.hmoRepository.find();
    }

    async getHmoTariff(id, urlParams): Promise<HmoRate[]> {
        const {listType } = urlParams;
        // find hmo record
        const hmo = await this.hmoRepository.findOne(id);
        if  (listType === 'services') {
            return await this.hmoRateRepository.find({where: {hmo}, relations: ['service']});
        } else {
            return await this.hmoRateRepository.find({where: {hmo}, relations: ['stock']});
        }
    }

    async createHmo(hmoDto: HmoDto, logo): Promise<Hmo> {
        return this.hmoRepository.saveHmo(hmoDto, logo);
    }

    async updateHmo(id: string, hmoDto: HmoDto, logo): Promise<Hmo> {
        const { name, address, phoneNumber, email }  = hmoDto;
        const hmo = await this.hmoRepository.findOne(id);
        hmo.name        = name;
        // hmo.logo        = logo;
        hmo.address     = address;
        hmo.phoneNumber = phoneNumber;
        hmo.email       = email;
        await hmo.save();
        return hmo;
    }

    async deleteHmo(id: string): Promise<void> {
        const result = await this.hmoRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`HMO with ID '${id}' not found`);
        }
    }

    async dowloadHmoSample() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'hmo-sample.csv',
            header: [
                {id: 'name', title: 'HMO Name'},
                {id: 'address', title: 'Address'},
                {id: 'email', title: 'Email Address'},
                {id: 'phoneNumber', title: 'Phone Number'},
            ],
        });

        const hmos = await this.hmoRepository.find();

        if (hmos.length) {
            for (const hmo of hmos) {
                const data = [
                    {
                        name: hmo.name,
                        address: hmo.address,
                        email: hmo.email,
                        phoneNumber: hmo.phoneNumber,
                    },
                ];

                await csvWriter.writeRecords(data);
            }
        } else {
            const data = [
                {
                    name: '',
                    address: '',
                    email: '',
                    phoneNumber: '',
                },
            ];
            await csvWriter.writeRecords(data);
        }
        return 'Completed';
    }

    async doUploadHmo(file: any) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const content = [];
        try {
            // read uploaded file
            fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (row) => {
                const data = {
                    name: row.name,
                    address: row.Address,
                    email: row['Email Address'],
                    phoneNumber: row['Phone Number'],
                };
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    // save service
                    await this.hmoRepository.save({
                            name: item.name,
                            address: item.address,
                            email: item.email,
                            phoneNumber: item.phoneNumber,
                        });
                }
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async downloadHmoRate(query) {
        const {downloadType} = query;

        if (downloadType === 'services') {
            return await this.downloadHmoServices();
        } else {
            return await this.downloadHmoStocks();
        }
    }

    private async downloadHmoServices() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'services.csv',
            header: [
                {id: 'category', title: 'CATEGORY'},
                {id: 'sub_category', title: 'SUB CATEGORY'},
                {id: 'code', title: 'CODE'},
                {id: 'name', title: 'SERVICE'},
                {id: 'amount', title: 'TARIFF'},
                {id: 'hmo_rate', title: 'HMO TARIFF'},
                {id: 'comment', title: 'COMMENT'},
                {id: 'percentage', title: 'PERCENTAGE'},
            ],
        });

        const services = await this.serviceRepository.find({relations: ['subCategory', 'category']});

        if (services.length) {
            for (const service of services) {
                const data = [
                    {
                        category: service.category.name,
                        sub_category: (service.subCategory) ? service.subCategory.name : '',
                        code: service.code,
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
                    code: '',
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
            path: 'stocks.csv',
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
                    code: row.Code,
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
                        service = await this.serviceRepository.find({ where: {code: item.code}});
                    } else {
                        stock = this.stockRepository.find({ where: {stock_code: item.code }});
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
}
