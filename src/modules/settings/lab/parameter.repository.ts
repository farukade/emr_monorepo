import { EntityRepository, Repository } from 'typeorm';
import { Parameter } from '../entities/parameters.entity';
import { ParameterDto } from './dto/parameter.dto';

@EntityRepository(Parameter)
export class ParameterRepository extends Repository<Parameter> {

    async saveParameter(parameterDto: ParameterDto): Promise<Parameter> {
        const { name } = parameterDto;
        const parameter = new Parameter();
        parameter.name = name;
        await parameter.save();
        return parameter;
    }
}
