import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Settings } from '../../modules/settings/entities/settings.entity';
import { slugify } from '../../common/utils/utils';

export default class CreateSettings implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const list = [
            { name: 'Part Payment Duration', value: '7' },
        ];
        // tslint:disable-next-line:forin
        for (const i in list) {
            try {
                const s = list[i];
                const item = new Settings();
                item.name = s.name;
                item.slug = slugify(s.name);
                item.value = s.value;
                item.createdBy = 'admin';
                await item.save();
            } catch (error) {
                continue;
            }
        }
    }
}
