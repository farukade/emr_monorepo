import { EntityRepository, Repository } from "typeorm";
import { ChatGroup } from "../entities/chat_room.entity";

@EntityRepository(ChatGroup)
export class ChatGroupRepository extends Repository<ChatGroup> { }