import { EntityRepository, Repository } from 'typeorm';
import { Group } from '../../entities/group.entity';
import { GroupTest } from '../../entities/group_tests.entity';

@EntityRepository(Group)
export class GroupTestRepository extends Repository<GroupTest> {
}
