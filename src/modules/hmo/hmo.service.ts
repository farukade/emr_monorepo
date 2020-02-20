import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HmoRepository } from './hmo.repository';
import { Hmo } from './hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { HmoUploadRateDto } from './dto/hmo.upload-rate.dto';

@Injectable()
export class HmoService {
    constructor(
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
    ) {}

    async getHmos(): Promise<Hmo[]> {
        return this.hmoRepository.find();
    }

    async createHmo(hmoDto: HmoDto, logo): Promise<Hmo> {
        return this.hmoRepository.saveHmo(hmoDto, logo);
    }

    async updateHmo(id: string, hmoDto: HmoDto, logo): Promise<Hmo> {
        const { name, address, phoneNumber, email }  = hmoDto;
        const hmo = await this.hmoRepository.findOne(id);
        hmo.name        = name;
        hmo.logo        = logo;
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
                    rate: row['HMO Rate']
                }
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    let service;
                    let stock;
                    // if (uploadType === 'service') {
                    //     service = await this.serviceRepository.find({ where: {code: item.code}});
                    // } else {
                    //     stock = this.stockRepository.find({ where: {stock_code: item.code }});
                    // }
                }
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }
}
