import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiagnosisRepository } from './diagnosis.repository';
import { DiagnosisUpdateDto } from './dto/diagnosis-update.dto';
import { Diagnosis } from '../entities/diagnosis.entity';
import { Brackets, Raw } from 'typeorm';
import { DiagnosisPaginationDto } from './dto/diagnosis-pagination.dto';
import { alphabets } from '../../../common/utils/utils';

@Injectable()
export class DiagnosisService {
    constructor(
        @InjectRepository(DiagnosisRepository)
        private diagnosisRepository: DiagnosisRepository,
    ) {
    }

    async getAllDiagnosis({ pagesize, page, q, alphabet }): Promise<DiagnosisPaginationDto> {
        const limit = pagesize ? parseInt(pagesize, 10) : 10;
        const skip = ((page ? parseInt(page, 10) : 1) - 1) * limit;
        const search = q || '';
        const alphaBet = alphabet || '';

        let diagnoses;
        let total: number;

        if (alphaBet === '') {
            if (search === '') {
                [diagnoses, total] = await this.diagnosisRepository.findAndCount({
                    skip,
                    take: limit,
                    order: { code: 'ASC' },
                });
            } else {
                [diagnoses, total] = await this.diagnosisRepository.findAndCount({
                    where: [
                        { code: Raw(alias => `LOWER(${alias}) Like '%${search.toLowerCase()}%'`) },
                        { description: Raw(alias => `LOWER(${alias}) Like '%${search.toLowerCase()}%'`) },
                    ],
                    skip,
                    take: limit,
                    order: { code: 'ASC' },
                });
            }
        } else {
            if (search === '') {
                [diagnoses, total] = await this.diagnosisRepository.findAndCount({
                    where: { code: Raw(alias => `LOWER(${alias}) Like '${alphaBet.toLowerCase()}%'`) },
                    skip,
                    take: limit,
                    order: { code: 'ASC' },
                });
            } else {
                [diagnoses, total] = await this.diagnosisRepository.createQueryBuilder('d')
                    .where('LOWER(d.code) Like :alphabet', { alphabet: `${alphaBet.toLowerCase()}%` })
                    .andWhere(new Brackets(qb => {
                        qb.where('LOWER(d.code) Like :code', { code: `%${search.toLowerCase()}%` })
                            .orWhere('LOWER(d.description) Like :description', { description: `%${search.toLowerCase()}%` });
                    }))
                    .skip(skip)
                    .take(limit)
                    .orderBy({ 'd.code': 'ASC' })
                    .getManyAndCount();
            }
        }

        return {
            data: diagnoses,
            total,
            size: limit,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async findDiagnosis(urlParam): Promise<Diagnosis[]> {
        const { q, diagnosisType } = urlParam;
        const search = q || '';

        if (diagnosisType && diagnosisType !== '') {
            return this.diagnosisRepository.createQueryBuilder('d')
                .where('"type" = :type', { type: diagnosisType })
                .andWhere(new Brackets(qb => {
                    qb.where('UPPER(d.code) Like :code', { code: `%${search.toUpperCase()}%` })
                        .orWhere('LOWER(d.description) Like :description', { description: `%${search.toLowerCase()}%` });
                }))
                .getMany();
        }

        return await this.diagnosisRepository.find({
            where: [
                { code: Raw(alias => `LOWER(${alias}) Like '%${search.toLowerCase()}%'`) },
                { description: Raw(alias => `LOWER(${alias}) Like '%${search.toLowerCase()}%'`) },
            ],
        });
    }

    async doUpload(file: any, { diagnosisType }) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const content = [];
        try {
            // read uploaded file
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', (row) => {
                    const keys = Object.keys(row);
                    const descriptionKey = keys.find(k => k && k.trim() === 'DESCRIPTION');

                    const data = {
                        code: row['PROCEDURE CODE'],
                        description: row[descriptionKey],
                        type: diagnosisType,
                    };
                    content.push(data);
                })
                .on('end', async () => {
                    for (const item of content) {
                        if (item.code.charAt(0) === '-') {
                            const code = item.code.substring(1);
                            const diagnoses = alphabets.map(a => ({ ...item, code: `${a}${code}` }));
                            for (const diagItem of diagnoses) {
                                content.push(diagItem);
                            }
                        }
                    }

                    for (const item of content) {
                        if (item.code.charAt(0) !== '-') {
                            // check if diagnosis exists
                            const diagnosisFind = await this.diagnosisRepository.findOne({ where: { code: item.code } });
                            if (!diagnosisFind) {
                                await this.diagnosisRepository.save(item);
                            }
                        }
                    }
                });

            return { success: true };
        } catch (err) {
            console.log(err);
            return { success: false, message: err.message };
        }
    }

    async updateDiagnosis(id: string, diagnosisUpdateDto: DiagnosisUpdateDto): Promise<Diagnosis> {
        const { code, description, type } = diagnosisUpdateDto;
        const diagnosis = await this.diagnosisRepository.findOne(id);
        diagnosis.code = code;
        diagnosis.description = description;
        diagnosis.type = type;
        await diagnosis.save();
        return diagnosis;
    }
}
