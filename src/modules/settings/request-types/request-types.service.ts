import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestTypeRepository } from './request-type.repository';
import { RequestTypeDto } from './dto/request-type.dto';
import { RequestType } from '../entities/request-type.entity';

@Injectable()
export class RequestTypesService {
    constructor(
        @InjectRepository(RequestTypeRepository)
        private requestTypeRepository: RequestTypeRepository,
    ) {}
    async getRequestTypes(): Promise<RequestType[]> {
        return this.requestTypeRepository.find();
    }

    async createRequestType(requestTypeDto: RequestTypeDto): Promise<RequestType> {
        return this.requestTypeRepository.saveRequestType(requestTypeDto);
    }

    async updateRequestType(id: string, requestTypeDto: RequestTypeDto): Promise<RequestType> {
        const { name, group } = requestTypeDto;
        const requestType = await this.requestTypeRepository.findOne(id);
        requestType.name = name;
        requestType.group = group;
        await requestType.save();
        return requestType;
    }

    async deleteRequestType(id: string): Promise<void> {
        const result = await this.requestTypeRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Request trype with ID '${id}' not found`);
        }
    }
}
