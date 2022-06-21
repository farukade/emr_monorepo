import { EntityRepository, Repository } from 'typeorm';
import { GroupTest } from '../../entities/group_tests.entity';

@EntityRepository(GroupTest)
export class GroupTestRepository extends Repository<GroupTest> {}
