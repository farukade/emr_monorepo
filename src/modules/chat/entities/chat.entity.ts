import { CustomBaseEntity } from "src/common/entities/custom-base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'chat' })
export class ChatEntity extends CustomBaseEntity {
    @Column({ nullable: true })
    body: string;

    @Column()
    sender_id: number;

    @Column()
    recipient_id: number;

    @Column({ nullable: true })
    chat_id: string;

    @Column({ nullable: true })
    room_id: string;

    @Column({ default: false })
    is_delivered: boolean;

    @Column({ default: false })
    is_sent: boolean;
    
    @Column({ default: false })
    is_read: boolean;
}