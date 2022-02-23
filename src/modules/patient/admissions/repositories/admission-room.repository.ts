import { Repository, EntityRepository } from 'typeorm';
import { AdmissionRoom } from '../entities/admission-room.entity';

@EntityRepository(AdmissionRoom)
export class AdmissionRoomRepository extends Repository<AdmissionRoom> {

}
