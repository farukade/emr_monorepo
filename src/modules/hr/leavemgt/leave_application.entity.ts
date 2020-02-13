import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { StaffDetails } from '../staff/staff_details.entity';
import { LeaveCategory } from '../../settings/entities/leave.category.entity';

@Entity({ name: 'leave_applications' })
export class LeaveApplication extends CustomBaseEntity {

    @ManyToOne(() => StaffDetails)
    @JoinColumn({ name: 'staff_id' })
    @Type(() => StaffDetails)
    staff: StaffDetails;

    @ManyToOne(type => LeaveCategory)
    @JoinColumn({ name: 'leave_category_id' })
    category: LeaveCategory;

    @Column({ type: 'varchar'})
    start_date: string;

    @Column({ type: 'varchar'})
    end_date: string;

    @Column({ type: 'varchar'})
    application: string;

    @Column({ type: 'varchar', nullable: true})
    comment: string;

    @Column({ default: 0 })
    status: number;

    @ManyToOne(type => StaffDetails, { nullable: true})
    @JoinColumn({ name: 'applied_by' })
    appliedBy!: StaffDetails;

    @ManyToOne(type => StaffDetails, { nullable: true})
    @JoinColumn({name: 'updated_by' })
    updatedBy!: StaffDetails;
}
