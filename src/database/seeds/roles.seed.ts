import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Role } from '../../modules/settings/entities/role.entity';

export default class CreateRole implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const roles = [
        {name: 'Administrator'},
        {name: 'Doctor'},
        {name: 'Nurse'},
        {name: 'Frontdest'},
        {name: 'Admin'},
    ];
    await connection
    .createQueryBuilder()
    .insert()
    .into(Role)
    .values(roles)
    .execute();
  }
}
