import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AdminStaffController } from './staff.controller';
import { AdminClientsController } from './clients.controller';
import { AdminZonesController } from './zones.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [PrismaModule, PaymentsModule, CalendarModule],
  controllers: [
    AdminController, 
    SettingsController, 
    AdminStaffController, 
    AdminClientsController, 
    AdminZonesController
  ],
  providers: [AdminService, SettingsService]
})
export class AdminModule {}
