import { EntityRepository, Repository, getRepository, getConnection } from 'typeorm';
import { LabTest } from '../entities/lab_test.entity';
import { LabTestDto } from './dto/lab_test.dto';
import { LabTestCategory } from '../entities/lab_test_category.entity';
import { slugify } from '../../../common/utils/utils';
import { Parameter } from '../entities/parameters.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';

@EntityRepository(LabTest)
export class LabTestRepository extends Repository<LabTest> {

    async saveLabTest(labTestDto: LabTestDto, category: LabTestCategory, createdBy: string, hmo: Hmo): Promise<LabTest> {
        const { name, price, test_type, description, parameters, specimens, hasParameters, hmoPrice } = labTestDto;
        const labTest = new LabTest();
        labTest.name = name;
        labTest.price = price;
        labTest.test_type = test_type;
        labTest.description = description;
        labTest.createdBy = createdBy;
        labTest.category = category;
        labTest.parameters = parameters;
        labTest.hasParameters = hasParameters;
        labTest.specimens = specimens;
        labTest.hmo = hmo;
        labTest.hmoPrice = hmoPrice;
        labTest.slug = slugify(name);
        await this.manager.save(labTest);
        return labTest;
    }

    async updateLabTest(labTestDto: LabTestDto, labTest: LabTest, category: LabTestCategory, updatedBy: string, hmo: Hmo): Promise<LabTest> {
        const { name, price, test_type, parameters, specimens, description, hasParameters, hmoPrice } = labTestDto;
        console.log(hasParameters);

        const allParameters = await this.saveParameters(parameters, updatedBy);

        labTest.name = name;
        labTest.slug = slugify(name);
        labTest.price = price;
        labTest.test_type = test_type;
        labTest.description = description;
        labTest.category = category;
        labTest.lastChangedBy = updatedBy;
        labTest.parameters = allParameters;
        labTest.hasParameters = hasParameters;
        labTest.specimens = specimens;
        labTest.hmo = hmo;
        if (labTest.hmo.id !== hmo.id) {
            labTest.hmoPrice = hmoPrice;
        }
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

    // async saveSubTests(labTest, subTests) {
    //     for (const item of subTests) {
    //         const subTest = await getRepository(LabTest)
    //         .createQueryBuilder('lab_tests')
    //         .where('lab_tests.id = :id', {id: item.id})
    //         .getOne();
    //         const labTestParameter = new LabTestParameter();
    //         labTestParameter.parameter_type = 'sub_test';
    //         labTestParameter.labTest = labTest;
    //         labTestParameter.subTest = subTest;
    //         await labTestParameter.save();
    //     }
    //   }
}
