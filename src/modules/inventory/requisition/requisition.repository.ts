import { EntityRepository, Repository } from 'typeorm';
import { Requisition } from './requisition.entity';

@EntityRepository(Requisition)
export class RequisitionRepository extends Repository<Requisition> {

    async saveRequisition(requisitionDto: any): Promise<Requisition> {
        const { item_id } = requisitionDto;

        // @ts-ignore
        // const item;

        const requisition = new Requisition();
        // requisition.item = item;
        await requisition.save();
        return requisition;
    }

}
