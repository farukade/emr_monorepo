import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Role } from '../../modules/settings/entities/role.entity';
import { Permission } from '../../modules/settings/entities/permission.entity';

export default class SetPermissionsSeed implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const roles = await Role.find();
        for (const r of roles) {
            const selectedPermission = await Permission.find();

            const role = await Role.findOne(r.id);
            role.permissions = selectedPermission;
            await role.save();
        }
    }
}
