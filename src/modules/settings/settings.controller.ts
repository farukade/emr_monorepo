import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  Delete,
  UseGuards,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Settings } from './entities/settings.entity';
import { SettingsDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@UseGuards(AuthGuard('jwt'))
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('')
  getSettings(@Request() request): Promise<Settings[]> {
    return this.settingsService.getSettings();
  }

  @Post('')
  @UsePipes(ValidationPipe)
  saveSetting(@Body() createDto: SettingsDto, @Request() req) {
    return this.settingsService.saveSetting(createDto, req.user.username);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateSetting(@Param('id') id: number, @Body() updateDto: SettingsDto, @Request() req) {
    return this.settingsService.updateSetting(id, updateDto, req.user.username);
  }

  @Post('/send-mail')
  @UsePipes(ValidationPipe)
  sendMail(@Body() params, @Request() req) {
    return this.settingsService.sendMail(params, req.user.username);
  }
}
