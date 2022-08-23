import { CustomBaseEntity } from "src/common/entities/custom-base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { IvfICSIEntity } from "./icsi.entity";

@Entity({ name: 'ivf_day_record' })
export class IcsiDayRecord extends CustomBaseEntity {
    @Column({ nullable: true })
    type: string;
    
    @Column({ nullable: true })
    one_pn: string;

    @Column({ nullable: true })
    two_pn: string;

    @Column({ nullable: true })
    three_pn: string;

    @Column({ nullable: true })
    mil: string;

    @Column({ nullable: true })
    ml: string;

    @Column({ nullable: true })
    gv: string;

    @Column({ nullable: true })
    others: string;

    @Column({ nullable: true })
    comment: string;

    @Column({ nullable: true })
    witness: string;

    @Column({ nullable: true })
    embryologist: string;

    @ManyToOne(() => IvfICSIEntity, icsi => icsi.icsi_day_record)
    @JoinColumn({ name: 'icsi_id' })
    icsi: IvfICSIEntity;
  
}