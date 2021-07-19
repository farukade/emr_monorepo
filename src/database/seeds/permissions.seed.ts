import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Permission } from '../../modules/settings/entities/permission.entity';

export default class CreatePermissions implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const permissions = JSON.parse(
            fs.readFileSync('src/database/seeds/dumbs/permissions.json', 'utf8'),
        );
        // tslint:disable-next-line:forin
        for (const i in permissions) {
            try {
                const s = permissions[i];
                const permission = new Permission();
                permission.name = s.name;
                permission.createdBy = 'it-admin';
                permission.save();
            } catch (error) {
                continue;
            }
        }
    }
}
