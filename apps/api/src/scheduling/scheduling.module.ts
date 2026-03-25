import { Module } from '@nestjs/common';
import { MapboxService } from './mapbox.service';
import { AvailabilityService } from './availability.service';
import { SchedulingController } from './scheduling.controller';
import { MonitorService } from './monitor/monitor.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MapboxService, AvailabilityService, MonitorService],
  controllers: [SchedulingController],
  exports: [AvailabilityService],
})
export class SchedulingModule {}
