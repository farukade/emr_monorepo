import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsRepository } from './settings.repository';
import { Settings } from './entities/settings.entity';
import { SettingsDto } from './dto/settings.dto';
import { getStaff, slugify } from '../../common/utils/utils';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SettingsService {
    constructor(
        private readonly mailerService: MailerService,
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

    async sendMail(params, sender) {
        const { email, subject, message } = params;

        try {
            const staff = await getStaff(sender);

            return await this.mailerService.sendMail({
                to: email,
                from: `"${staff.first_name} ${staff.last_name}" <${staff?.email || 'info@dedahospital.com'}>`,
                subject,
                template: 'mail',
                context: {
                    message,
                    logo: `${process.env.ENDPOINT}/public/images/logo.png`,
                },
            });

        } catch (error) {
            console.log(error);
            throw new BadRequestException(`Failed to send email to '${email}'`);
        }
    }
}
