import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiagnosisRepository } from './diagnosis.repository';
import { DiagnosisUpdateDto } from './dto/diagnosis-update.dto';
import { Diagnosis } from '../entities/diagnosis.entity';
import { Like } from 'typeorm';

@Injectable()
export class DiagnosisService {
    constructor(
        @InjectRepository(DiagnosisRepository)
        private diagnosisRepository: DiagnosisRepository,
    ) {}

    async getAllDiagnosis({diagnosisType}): Promise<Diagnosis[]> {
        return this.diagnosisRepository.find({where: {diagnosisType}});
    }

    async findDiagnosis(urlParam): Promise<Diagnosis[]> {
        const {q} = urlParam;

        return this.diagnosisRepository.find({where: [
            {procedureCode: Like(`%${q}%`)},
            {icd10Code: Like(`%${q}%`)},
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
                const data = {
                    procedureCode: row['PROCEDURE CODE'],
                    icd10Code: row['ICD10 CODE'],
                    description: row.DESCRIPTION,
                    diagnosisType,
                };
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    // check if procedure exists
                    const procedure = await this.diagnosisRepository.findOne({where : {icd10Code: item.icd10Code}});
                    if (!procedure) {
                        // save procedure
                        await this.diagnosisRepository.save(item);
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
