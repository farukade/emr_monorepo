import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsRepository } from './settings.repository';
import { Settings } from './entities/settings.entity';
import { SettingsDto } from './dto/settings.dto';
import { getStaff, slugify } from '../../common/utils/utils';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class SettingsService {
  constructor(
    private queueService: QueueService,
    @InjectRepository(SettingsRepository)
    private settingsRepository: SettingsRepository,
  ) {}

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

  async sendMail(params, sender) {
    const { email, subject, message } = params;

    try {
      const staff = await getStaff(sender);

      const mail = {
        from_name: `${staff.first_name} ${staff.last_name}`,
        from_email: staff?.email || '',
        to_email: email,
        subject,
        message,
      };

      await this.queueService.queueJob('send', mail);

      return { scheduled: true };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Failed to send email to '${email}'`);
    }
  }
}
