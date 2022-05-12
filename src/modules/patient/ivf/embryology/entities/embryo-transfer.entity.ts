import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IvfEmbryoTransferRecord } from './embryo-trans-record.entity';

@Entity({ name: 'ivf_embryo_transfer' })
export class IvfEmbryoTransfer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	nameOfEmbryoTransfered: string;

	@Column({ nullable: true })
	numOfEmbryoTransfered: number;

	@Column({ nullable: true, type: 'date' })
	dateOfEmbryoTransfered: string;

	@Column({ nullable: true })
	dr: string;

	@Column({ nullable: true })
	embryologist: string;

	@Column({ nullable: true, type: 'date' })
	date: string;

	@Column({ nullable: true })
	numOfEmbryoVit: number;

	@Column({ nullable: true })
	numOfStraws: number;

	@ManyToOne(() => IvfEmbryoTransferRecord, { nullable: true })
	@JoinColumn({ name: 'ivf_embryo_trans_record_id' })
	ivfEmbryoTranferRecord: IvfEmbryoTransferRecord;
}
