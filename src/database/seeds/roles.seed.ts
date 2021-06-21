import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Role } from '../../modules/settings/entities/role.entity';

export default class CreateRole implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const roles = [
            { name: 'Administrator', slug: 'administrator' },
            { name: 'Doctor', slug: 'doctor' },
            { name: 'Nurse', slug: 'nurse' },
            { name: 'Front Desk', slug: 'front-desk' },
            { name: 'Admin', slug: 'admin' },
            { name: 'Pharmacy', slug: 'pharmacy' },
            { name: 'Accountant', slug: 'accountant' },
            { name: 'Lab Attendant', slug: 'lab-attendant' },
            { name: 'HR Manager', slug: 'hr-manager' },
            { name: 'HMO Officer', slug: 'hmo-officer' },
            { name: 'Cafeteria', slug: 'cafeteria' },
        ];
        // tslint:disable-next-line:forin
        for (const i in roles) {
            try {
                const s = roles[i];
                const role = new Role();
                role.slug = s.slug;
                role.name = s.name;
                await role.save();
            } catch (error) {
                continue;
            }
        }
    }
}
