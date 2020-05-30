import * as bcrypt from 'bcrypt';
import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../../modules/hr/entities/user.entity';
import { Role } from '../../modules/settings/entities/role.entity';
import { StaffDetails } from '../../modules/hr/staff/entities/staff_details.entity';

export default class CreateUser implements Seeder {
    private saltRounds = 10;

    public async run(factory: Factory, connection: Connection): Promise<any> {
        const role = await connection.getRepository(Role)
                        .createQueryBuilder('role')
                        .where('role.name = :name', { name: 'Admin' })
                        .getOne();

        const user = new User();
        user.username = 'admin1';
        user.password = await this.getHash('secret');
        user.role = role;
        await user.save();

        const staff = new StaffDetails();
        staff.first_name     = 'Admin'.toLocaleLowerCase();
        staff.last_name      = 'Deda'.toLocaleLowerCase();
        staff.email          = 'admin@deda.com';
        staff.user = user;
        staff.emp_code = 'DEDA-' + Math.floor(Math.random() * 90000),

        await staff.save();
    }

  async getHash(password: string | undefined): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
