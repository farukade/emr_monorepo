import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Country } from '../../common/entities/country.entity';
import {State} from "../../common/entities/state.entity";

export default class CreateCountries implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const countries = JSON.parse(
      fs.readFileSync('src/database/seeds/dumbs/countries.json', 'utf8'),
    );
    for (const i in countries) {
      try {
        const c = countries[i];
        const country = new Country();
        country.id = c.id;
        country.name = c.name;
        country.save();
      } catch (error) {
        continue;
      }
    }
  }
}
