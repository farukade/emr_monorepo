import * as bcrypt from 'bcrypt';
import { Connection, getConnection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../../modules/auth/entities/user.entity';
import { Role } from '../../modules/settings/entities/role.entity';
import { StaffDetails } from '../../modules/hr/staff/entities/staff_details.entity';
import { Department } from '../../modules/settings/entities/department.entity';

export default class CreateUser implements Seeder {
    private saltRounds = 10;

    public async run(factory: Factory, connection: Connection): Promise<any> {
        const role = await connection.getRepository(Role)
            .createQueryBuilder('r')
            .where('r.slug = :slug', { slug: 'it-admin' })
            .getOne();

        const user = new User();
        user.username = 'admin';
        user.password = await this.getHash('secret');
        user.role = role;
        await user.save();

        const staff = new StaffDetails();
        staff.first_name = 'Admin'.toLocaleLowerCase();
        staff.last_name = 'Deda'.toLocaleLowerCase();
        staff.email = 'admin@deda.com';
        staff.user = user;
        staff.employee_number = 'DH140';
        staff.department = await getConnection().getRepository(Department).findOne({ where: { name: 'ICT' } });

        await staff.save();
    }

    async getHash(password: string | undefined): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }
}
