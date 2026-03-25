import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private service: BookingsService) {}

  @Roles('client')
  @Post()
  async create(@Request() req, @Body() data: any) {
    return this.service.create({ ...data, userId: req.user.userId });
  }

  @Roles('client')
  @Get()
  async getMyBookings(@Request() req) {
    return this.service.findByUserId(req.user.userId);
  }

  @Roles('client')
  @Patch(':id/cancel')
  async cancelBooking(@Request() req, @Param('id') id: string) {
    return this.service.cancelByUserId(+id, req.user.userId);
  }
}
