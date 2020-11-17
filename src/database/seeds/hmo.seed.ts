import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Hmo } from '../../modules/hmo/entities/hmo.entity';

export default class CreateHmos implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const hmos = [
            { name: 'Private' },
        ];

        // tslint:disable-next-line:forin
        for (const i in hmos) {
            try {
                const h = hmos[i];
                const hmo = new Hmo();
                hmo.name = h.name;
                await hmo.save();
            } catch (error) {
                continue;
            }
        }
    }
}