import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Bank } from '../../common/entities/bank.entity';

export default class CreateBanks implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const banks = JSON.parse(
      fs.readFileSync('src/database/seeds/dumbs/banks.json', 'utf8'),
    );
    await connection
      .createQueryBuilder()
      .insert()
      .into(Bank)
      .values(banks)
      .execute();
  }
}
