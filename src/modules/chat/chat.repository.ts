import { EntityRepository, Repository } from "typeorm";
import { ChatEntity } from "./entities/chat.entity";

@EntityRepository(ChatEntity)
export class ChatRepository extends Repository<ChatEntity> {}