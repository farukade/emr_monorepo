/* eslint-disable @typescript-eslint/no-unused-vars */
import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import {Department} from '../../modules/settings/entities/department.entity';
import { slugify } from '../../common/utils/utils';

export default class CreateDepartments implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const departments = JSON.parse(
      fs.readFileSync('src/database/seeds/dumbs/departments.json', 'utf8'),
    );
    for (const i in departments) {
      try {
        const s = departments[i];
        const department = new Department();
        department.name = s.name;
        department.slug = slugify(s.name);
        department.createdBy = 'admin';
        department.save();
      } catch (error) {
        continue;
      }
    }
  }
}
