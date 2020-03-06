import { EntityRepository, Repository } from 'typeorm';
import { User } from '../hr/entities/user.entity';

@EntityRepository(User)
export class AuthRepository extends Repository<User> {}
