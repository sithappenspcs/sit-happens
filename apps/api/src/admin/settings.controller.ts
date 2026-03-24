import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles('admin')
  @Get()
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Roles('admin')
  @Get(':key')
  getSettingByKey(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @Roles('admin')
  @Patch('bulk')
  bulkUpdateSettings(@Body('settings') settings: { key: string; value: string }[]) {
    return this.settingsService.bulkUpdateSettings(settings);
  }

  @Roles('admin')
  @Patch(':key')
  updateSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.updateSetting(key, value);
  }
}
