import { EntityRepository, Repository, getRepository, getConnection } from 'typeorm';
import { LabTest } from '../entities/lab_test.entity';
import { LabTestDto } from './dto/lab_test.dto';
import { LabTestCategory } from '../entities/lab_test_category.entity';
import { LabTestParameter } from '../entities/lab_test_parameter.entity';
import { Parameter } from '../entities/parameters.entity';

@EntityRepository(LabTest)
export class LabTestRepository extends Repository<LabTest> {

    async saveLabTest(labTestDto: LabTestDto, category: LabTestCategory, createdBy: string): Promise<LabTest> {
        const { name, price, test_type, description, parameters, sub_tests  } = labTestDto;
        const labTest = new LabTest();
        labTest.name    = name;
        labTest.price   = price;
        labTest.test_type = test_type;
        labTest.description = description;
        labTest.createdBy = createdBy;
        labTest.category = category;
        await this.manager.save(labTest);

        if (parameters.length) {
            await this.saveParameters(labTest, parameters);
        }

        if (sub_tests && sub_tests.length) {
            await this.saveSubTests(labTest, sub_tests);
        }
        labTest.parameters = parameters;
        return labTest;
    }

    async updateLabTest(labTestDto: LabTestDto, labTest: LabTest, category: LabTestCategory, updatedBy: string): Promise<LabTest> {
        const { name, price, test_type, parameters, sub_tests, description  } = labTestDto;
        labTest.name    = name;
        labTest.price   = price;
        labTest.test_type = test_type;
        labTest.description = description;
        labTest.category = category;
        labTest.lastChangedBy = updatedBy;
        await this.manager.save(labTest);

        // delete previous parameters
        await getConnection()
        .createQueryBuilder()
        .delete()
        .from(LabTestParameter)
        .where('lab_test_parameters.lab_test_id = :id', {id: labTest.id})
        .execute();

        if (parameters.length) {
            await this.saveParameters(labTest, parameters);
        }

        if (sub_tests && sub_tests.length) {
            await this.saveSubTests(labTest, sub_tests);
        }
        labTest.parameters = parameters;
        return labTest;
    }

    async saveParameters(labTest, parameters) {
        for (const item of parameters) {
            const parameter = await getRepository(Parameter)
            .createQueryBuilder('parameters')
            .where('parameters.id = :id', {id: item.parameter_id})
            .getOne();
            const labTestParameter = new LabTestParameter();
            labTestParameter.parameter_type = 'parameter';
            labTestParameter.referenceRange = item.referenceRange;
            labTestParameter.labTest = labTest;
            labTestParameter.parameter = parameter;
            await labTestParameter.save();
        }
    }

    async saveSubTests(labTest, subTests) {
        for (const item of subTests) {
            const subTest = await getRepository(LabTest)
            .createQueryBuilder('lab_tests')
            .where('lab_tests.id = :id', {id: item})
            .getOne();
            const labTestParameter = new LabTestParameter();
            labTestParameter.parameter_type = 'sub_test';
            labTestParameter.labTest = labTest;
            labTestParameter.subTest = subTest;
            await labTestParameter.save();
        }
      }
}
