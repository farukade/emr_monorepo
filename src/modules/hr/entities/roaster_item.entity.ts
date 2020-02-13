import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { ManyToOne, Column, Entity, JoinColumn } from 'typeorm';
import { Roaster } from './roaster.entity';
import { StaffDetails } from './staff_details.entity';
import { scheduled } from 'rxjs';

@Entity({ name: 'roaster_items'})
export class RoasterItem extends CustomBaseEntity {
    @ManyToOne(type => Roaster)
    @JoinColumn({ name: 'roaster_id'})
    roaster: Roaster;

    @ManyToOne(type => StaffDetails)
    @JoinColumn({ name: 'staff_id'})
    staff: StaffDetails;

    @Column({ type: 'jsonb'})
    schedule: string;
}
