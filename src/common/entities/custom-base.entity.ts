import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export abstract class CustomBaseEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 300, nullable: true })
    createdBy: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    lastChangedBy: string;

    @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
    deletedAt: Date;

    @Column({ type: 'varchar', length: 300, nullable: true })
    deletedBy: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
