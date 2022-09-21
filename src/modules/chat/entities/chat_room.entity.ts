import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { CustomBaseEntity } from "../../../common/entities/custom-base.entity";
import { StaffDetails } from "../../hr/staff/entities/staff_details.entity";
import { ChatEntity } from "./chat.entity";

@Entity({ name: 'chat_rooms' })
export class ChatGroup extends CustomBaseEntity {
  @Column({ unique: true })
  name: string;

  @ManyToMany((type) => StaffDetails)
  @JoinTable()
  staffs: StaffDetails[];

  @OneToMany(() => ChatEntity, (chats) => chats.room)
  chats: ChatGroup[];
}