import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { Stock } from '../entities/stock.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { CafeteriaItem } from '../cafeteria/entities/cafeteria_item.entity';

@Entity({ name: 'requisitions' })
export class Requisition extends CustomBaseEntity {
    @ManyToOne(type => StaffDetails)
    @JoinColumn({ name: 'staff_id' })
    staff: StaffDetails;

    @ManyToOne(type => Stock, { nullable: true })
    @JoinColumn({ name: 'stock_id' })
    stock: Stock;

    @ManyToOne(type => CafeteriaItem, { nullable: true })
    @JoinColumn({ name: 'cafeteria_id' })
    item: CafeteriaItem;
}
