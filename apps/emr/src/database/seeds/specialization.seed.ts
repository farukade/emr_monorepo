/* eslint-disable @typescript-eslint/no-unused-vars */
import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Specialization } from '../../modules/settings/entities/specialization.entity';

export default class CreateSpecialization implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const specializations = JSON.parse(
            fs.readFileSync('src/database/seeds/dumbs/specializations.json', 'utf8'),
        );
        
        for (const i in specializations) {
            try {
                const s = specializations[i];
                const spec = new Specialization();
                spec.name = s.name;
                spec.createdBy = 'admin';
                spec.save();
            } catch (error) {
                continue;
            }
        }
    }
}
