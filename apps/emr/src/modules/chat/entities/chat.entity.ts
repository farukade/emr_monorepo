import { CustomBaseEntity } from "apps/emr/src/common/entities/custom-base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { ChatGroup } from "./chat_room.entity";

@Entity({ name: 'chat' })
export class ChatEntity extends CustomBaseEntity {
    @Column()
    body: string;

    @Column()
    sender_id: number;

    @Column({ nullable: true })
    recipient_id: number;

    @Column({ nullable: true })
    chat_id: string;

    @ManyToOne(() => ChatGroup, (room) => room.chats, { nullable: true })
    @JoinColumn({ name: 'room_id' })
    room: ChatGroup;

    @Column({ default: false })
    is_delivered: boolean;

    @Column({ default: false })
    is_sent: boolean;
    
    @Column({ default: false })
    is_read: boolean;
}