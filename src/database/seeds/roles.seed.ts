import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Role } from '../../modules/settings/entities/role.entity';

export default class CreateRole implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const roles = [
            { name: 'Doctor', slug: 'doctor' },
            { name: 'Nurse', slug: 'nurse' },
            { name: 'Front Desk', slug: 'front-desk' },
            { name: 'Pharmacy', slug: 'pharmacy' },
            { name: 'Accounts', slug: 'accounts' },
            { name: 'Paypoint', slug: 'paypoint' },
            { name: 'Lab Attendant', slug: 'lab-attendant' },
            { name: 'HR Manager', slug: 'hr-manager' },
            { name: 'HMO Officer', slug: 'hmo-officer' },
            { name: 'Cafeteria', slug: 'cafeteria' },
            { name: 'Store', slug: 'store' },
            { name: 'Records', slug: 'records' },
            { name: 'IT Admin', slug: 'it-admin' },
        ];
        // tslint:disable-next-line:forin
        for (const i in roles) {
            try {
                const s = roles[i];
                const role = new Role();
                role.slug = s.slug;
                role.name = s.name;
                role.createdBy = 'it-admin';
                await role.save();
            } catch (error) {
                continue;
            }
        }
    }
}
