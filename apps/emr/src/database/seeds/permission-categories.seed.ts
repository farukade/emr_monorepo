/* eslint-disable @typescript-eslint/no-unused-vars */
import fs = require('fs');
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { slugify } from '../../common/utils/utils';
import { PermissionCategory } from "../../modules/settings/entities/permission-category.entity";

export default class CreatePermissionCategories implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const categories = JSON.parse(
      fs.readFileSync('src/database/seeds/dumbs/permission-categories.json', 'utf8'),
    );
    for (const i in categories) {
      try {
        const s = categories[i];
        const category = new PermissionCategory();
        category.name = s.name;
        category.slug = slugify(s.name);
        category.createdBy = 'admin';
        await category.save();
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  }
}
