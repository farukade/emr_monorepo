/* eslint-disable @typescript-eslint/no-unused-vars */
import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Bank } from '../../common/entities/bank.entity';

export default class CreateBanks implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const banks = JSON.parse(
      fs.readFileSync('src/database/seeds/dumbs/banks.json', 'utf8'),
    );
    
    for (const i in banks) {
      try {
        const s = banks[i];
        const bank = new Bank();
        bank.id = s.id;
        bank.name = s.name;
        bank.save();
      } catch (error) {
        continue;
      }
    }
  }
}
