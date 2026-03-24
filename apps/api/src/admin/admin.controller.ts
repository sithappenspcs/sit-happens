import { Controller, Post, Param, ParseIntPipe, Body, UseGuards, Patch, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Post('bookings/:id/approve')
  approveBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { staffId: number }
  ) {
    return this.adminService.approveBooking(id, body.staffId);
  }

  @Roles('admin')
  @Post('bookings/:id/decline')
  declineBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string
  ) {
    return this.adminService.declineBooking(id, reason);
  }

  @Roles('admin')
  @Post('bookings/:id/refund')
  refundBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount') amount?: string
  ) {
    return this.adminService.refundBooking(id, amount);
  }

  @Roles('admin')
  @Patch('bookings/:id')
  modifyBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any
  ) {
    return this.adminService.modifyBooking(id, data);
  }

  @Roles('admin')
  @Get('bookings')
  getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Roles('admin')
  @Get('payouts')
  getAllPayouts() {
    return this.adminService.getAllPayouts();
  }

  @Roles('admin')
  @Get('kpis')
  getKpis() {
    return this.adminService.getDashboardKpis();
  }
}
