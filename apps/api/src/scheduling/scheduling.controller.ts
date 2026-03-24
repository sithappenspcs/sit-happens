import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('scheduling')
export class SchedulingController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get('slots')
  async getSlots(
    @Query('date') date: string,
    @Query('packageId') packageId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('durationMinutes') durationMinutes: string
  ) {
    return this.availabilityService.getAvailableSlots({
      date,
      packageId: parseInt(packageId),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      durationMinutes: parseInt(durationMinutes || '30'),
    });
  }
}
