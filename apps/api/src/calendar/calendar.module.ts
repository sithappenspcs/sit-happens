import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleCalendarStrategy } from './google-calendar.strategy';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [CalendarController],
  providers: [CalendarService, GoogleCalendarStrategy],
  exports: [CalendarService],
})
export class CalendarModule {}
