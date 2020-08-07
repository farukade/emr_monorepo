import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Country } from '../../common/entities/country.entity';
import { State } from '../../common/entities/state.entity';

export default class CreateStates implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const states = JSON.parse(
      fs.readFileSync('src/database/seeds/dumbs/states.json', 'utf8'),
    );

    // tslint:disable-next-line:forin
    for (const i in states) {
      try {
          const s = states[i];
          const state = new State();
          state.id = s.id;
          state.name = s.name;
          state.country = await Country.findOne(s.country_id);;
          await state.save();
      } catch (error) {
          continue;
      }
    }
  }
}
