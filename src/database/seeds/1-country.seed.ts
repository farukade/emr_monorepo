import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Country } from '../../common/entities/country.entity';

export default class CreateCountries implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const countries = JSON.parse(
        fs.readFileSync('src/database/seeds/dumbs/countries.json', 'utf8'),
    );
    await connection
        .createQueryBuilder()
        .insert()
        .into(Country)
        .values(countries)
        .execute();
  }
}
