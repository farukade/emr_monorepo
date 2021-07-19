import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { HmoType } from '../../modules/hmo/entities/hmo_type.entity';

export default class CreateHmoTypes implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const types = [
            { name: 'Self Pay' },
            { name: 'Corporate' },
            { name: 'NHIS' },
            { name: 'PHIS' },
        ];

        // tslint:disable-next-line:forin
        for (const i in types) {
            try {
                const t = types[i];

                const type = new HmoType();
                type.name = t.name;
                await type.save();

            } catch (error) {
                continue;
            }
        }
    }
}
