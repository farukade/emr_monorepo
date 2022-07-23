import { CustomBaseEntity } from "src/common/entities/custom-base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { IvfSpermPreparationEntity } from "./sperm-prep.entity";

@Entity()
export class CellInfo extends CustomBaseEntity {
    @Column()
    type: string;

    @Column({ type: "float4", nullable: true })
    volume: number;

    @Column({ nullable: true })
    cells: string;

    @Column({ nullable: true })
    density: string;

    @Column({ nullable: true })
    motility: string;

    @Column({ nullable: true })
    prog: string;

    @Column({ type: "float4", nullable: true })
    abnor: number;

    @Column({ type: "float4", nullable: true })
    agglutination: number;

    @ManyToOne(() => IvfSpermPreparationEntity, sperm_prep => sperm_prep.cell_info)
    @JoinColumn({ name: 'sperm_prep_id' })
    sperm_prep: IvfSpermPreparationEntity;

}