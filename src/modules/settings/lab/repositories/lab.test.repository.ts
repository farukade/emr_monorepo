import { EntityRepository, Repository, getRepository } from 'typeorm';
import { LabTest } from '../../entities/lab_test.entity';
import { LabTestDto } from '../dto/lab_test.dto';
import { LabTestCategory } from '../../entities/lab_test_category.entity';
import { Parameter } from '../../entities/parameters.entity';
import { Service } from '../../entities/service.entity';

@EntityRepository(LabTest)
export class LabTestRepository extends Repository<LabTest> {

    async saveLabTest(labTestDto: LabTestDto, category: LabTestCategory, createdBy: string, service: Service): Promise<LabTest> {
        const { name, parameters, specimens, hasParameters } = labTestDto;
        const labTest = new LabTest();
        labTest.code = service.code;
        labTest.name = name;
        labTest.createdBy = createdBy;
        labTest.category = category;
        labTest.parameters = parameters;
        labTest.hasParameters = hasParameters;
        labTest.specimens = specimens;
        await this.manager.save(labTest);
        return labTest;
    }

    async updateLabTest(labTestDto: LabTestDto, labTest: LabTest, category: LabTestCategory, updatedBy: string): Promise<LabTest> {
        const { name, parameters, specimens, hasParameters } = labTestDto;

        const allParameters = await this.saveParameters(parameters || [], updatedBy);

        labTest.name = name;
        labTest.category = category;
        labTest.lastChangedBy = updatedBy;
        labTest.parameters = allParameters;
        labTest.hasParameters = hasParameters;
        labTest.specimens = specimens;
        labTest = await this.manager.save(labTest);

        return labTest;
    }

    async saveParameters(items, updatedBy) {
        let parameters = [];
        for (const item of items) {
            let parameter;
            if (item.id) {
                parameter = await getRepository(Parameter)
                    .createQueryBuilder('parameters')
                    .where('parameters.id = :id', { id: item.id })
                    .getOne();

            } else {
                const labParameter = new Parameter();
                labParameter.name = item.name;
                labParameter.reference = item.reference;
                labParameter.createdBy = updatedBy;
                parameter = await labParameter.save();
            }

            parameters = [...parameters, parameter];
        }

        return parameters;
    }
}
