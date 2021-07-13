import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsRepository } from './settings.repository';
import { Settings } from './entities/settings.entity';
import { SettingsDto } from './dto/settings.dto';
import { slugify } from '../../common/utils/utils';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(SettingsRepository)
        private settingsRepository: SettingsRepository,
    ) {

    }

    async getSettings(): Promise<Settings[]> {
        return await this.settingsRepository.find();
    }

    async saveSetting(createDto: SettingsDto, createdBy): Promise<Settings> {
        const { name, value } = createDto;

        const setting = new Settings();
        setting.name = name;
        setting.slug = slugify(name);
        setting.value = value;
        setting.createdBy = createdBy;

        return await this.settingsRepository.save(setting);
    }

    async updateSetting(id, updateDto: SettingsDto, updatedBy) {
        const { name, value } = updateDto;

        const setting = await this.settingsRepository.findOne(id);
        setting.name = name;
        setting.slug = slugify(name);
        setting.value = value;
        setting.lastChangedBy = updatedBy;
        await setting.save();

        return setting;
    }
}
