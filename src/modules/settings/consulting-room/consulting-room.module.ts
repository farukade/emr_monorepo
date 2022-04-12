import { Module } from '@nestjs/common';
import { ConsultingRoomController } from './consulting-room.controller';
import { ConsultingRoomService } from './consulting-room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultingRoomRepository } from './consulting-room.repository';

@Module({
	imports: [TypeOrmModule.forFeature([ConsultingRoomRepository])],
	controllers: [ConsultingRoomController],
	providers: [ConsultingRoomService],
})
export class ConsultingRoomModule {}
