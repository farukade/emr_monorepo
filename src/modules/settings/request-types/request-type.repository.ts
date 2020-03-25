import { EntityRepository, Repository } from 'typeorm';
import { RequestType } from '../entities/request-type.entity';
import { RequestTypeDto } from './dto/request-type.dto';

@EntityRepository(RequestType)
export class RequestTypeRepository extends Repository<RequestType> {

    async saveRequestType(requestTypeDto: RequestTypeDto): Promise<RequestType> {
        const { name, group }  = requestTypeDto;
        const requestType  = new RequestType();
        requestType.name   = name;
        requestType.group   = group;
        await requestType.save();
        return requestType;
    }
}
