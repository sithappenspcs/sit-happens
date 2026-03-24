import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    return this.prisma.siteSetting.findMany();
  }

  async getSettingByKey(key: string) {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key }
    });
    if (!setting) throw new NotFoundException(`Setting ${key} not found`);
    return setting;
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  async bulkUpdateSettings(settings: { key: string; value: string }[]) {
    return this.prisma.$transaction(
      settings.map((s) =>
        this.prisma.siteSetting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value }
        })
      )
    );
  }
}
