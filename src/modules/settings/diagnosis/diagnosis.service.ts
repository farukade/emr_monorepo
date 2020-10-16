import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiagnosisRepository } from './diagnosis.repository';
import { DiagnosisUpdateDto } from './dto/diagnosis-update.dto';
import { Diagnosis } from '../entities/diagnosis.entity';
import { Like } from 'typeorm';
import { DiagnosisPaginationDto } from './dto/diagnosis-pagination.dto';

const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

@Injectable()
export class DiagnosisService {
    constructor(
        @InjectRepository(DiagnosisRepository)
        private diagnosisRepository: DiagnosisRepository,
    ) {}

    async getAllDiagnosis({pagesize, page}): Promise<DiagnosisPaginationDto> {
        const limit = pagesize ? parseInt(pagesize, 10) : 10;
        const skip = ((page ? parseInt(page, 10) : 1) - 1) * limit;

        const diagnoses = await this.diagnosisRepository.find({
            skip,
            take: limit,
        });

        const total: number = await this.diagnosisRepository.count();

        return {
            data: diagnoses,
            total,
            size: limit,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async findDiagnosis(urlParam): Promise<Diagnosis[]> {
        const {q, diagnosisType} = urlParam;

        return this.diagnosisRepository.find({where: [
            {procedureCode: Like(`%${diagnosisType}%`)},
            {icd10Code: Like(`%${diagnosisType}%`)},
                {description: Like(`%${q}%`)},
        ]});
    }

    async doUpload(file: any, {diagnosisType}) {
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
                    procedureCode: row['PROCEDURE CODE'],
                    icd10Code: row['ICD10 CODE'],
                    description: row[descriptionKey],
                    diagnosisType,
                };
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    if (item.procedureCode.charAt(0) === '-') {
                        const procedureCode = item.procedureCode.substring(1);
                        const diagnoses = alphabets.map(a => ({ ...item, procedureCode: `${a}${procedureCode}` }));
                        for (const diagItem of diagnoses) {
                            content.push(diagItem);
                        }
                    }
                }

                for (const item of content) {
                    if (item.procedureCode.charAt(0) !== '-') {
                        if (item.diagnosisType === '2') {
                            // check if procedure exists
                            // const procedure = await this.diagnosisRepository.findOne({where : {procedureCode: item.procedureCode}});
                            await this.diagnosisRepository.save({ ...item, icd10Code: null });
                        } else {
                            // check if procedure exists
                            const procedure = await this.diagnosisRepository.findOne({where : {icd10Code: item.icd10Code}});
                            if (!procedure) {
                                // save procedure
                                await this.diagnosisRepository.save({ ...item, icd10Code: item.icd10Code === '' ? null : item.icd10Code });
                            }
                        }
                    }
                }
            });

            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async updateDiagnosis(id: string, diagnosisUpdateDto: DiagnosisUpdateDto): Promise<Diagnosis> {
        const { procedureCode, icd10Code, description, diagnosisType } = diagnosisUpdateDto;
        const procedure = await this.diagnosisRepository.findOne(id);
        procedure.procedureCode = procedureCode;
        procedure.icd10Code     = icd10Code;
        procedure.description   = description;
        procedure.diagnosisType = diagnosisType;
        await procedure.save();
        return procedure;
    }
}
