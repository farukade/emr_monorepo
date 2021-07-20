import { EntityRepository, Repository } from 'typeorm';
import { Group } from '../../entities/group.entity';
import { GroupDto } from '../dto/group.dto';
import { slugify } from '../../../../common/utils/utils';

@EntityRepository(Group)
export class GroupRepository extends Repository<Group> {

    async saveGroup(groupDto: GroupDto, createdBy: string): Promise<any> {
        const { name, description } = groupDto;
        const group = new Group();
        group.name = name;
        group.slug = slugify(name);
        group.description = description;
        group.createdBy = createdBy;
        return await group.save();
    }
}
