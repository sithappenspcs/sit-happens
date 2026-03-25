import { Controller, Get, Post, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { StaffOperationsService } from './staff-operations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff-operations')
export class StaffOperationsController {
  constructor(
    private readonly staffOpsService: StaffOperationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles('staff')
  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.staffOpsService.getDashboard(req.user.userId);
  }

  @Roles('staff')
  @Get('jobs/:id')
  getJobDetails(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.staffOpsService.getJobDetails(req.user.userId, id);
  }

  // Flat routes used by frontend api.ts
  @Roles('staff')
  @Post('check-in')
  checkInFlat(
    @Request() req,
    @Body('bookingId') bookingId: number,
    @Body('photoUrls') photoUrls: string[] = [],
    @Body('note') note?: string,
  ) {
    return this.staffOpsService.checkIn(req.user.userId, bookingId, photoUrls, note);
  }

  @Roles('staff')
  @Post('check-out')
  checkOutFlat(
    @Request() req,
    @Body('bookingId') bookingId: number,
    @Body('photoUrls') photoUrls: string[] = [],
    @Body('note') note?: string,
  ) {
    return this.staffOpsService.checkOut(req.user.userId, bookingId, photoUrls, note);
  }

  // Legacy param-based routes kept for compatibility
  @Roles('staff')
  @Post('jobs/:id/checkin')
  checkIn(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('photoUrls') photoUrls: string[] = [],
    @Body('note') note?: string,
  ) {
    return this.staffOpsService.checkIn(req.user.userId, id, photoUrls, note);
  }

  @Roles('staff')
  @Post('jobs/:id/checkout')
  checkOut(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('photoUrls') photoUrls: string[] = [],
    @Body('note') note?: string,
  ) {
    return this.staffOpsService.checkOut(req.user.userId, id, photoUrls, note);
  }

  @Roles('staff')
  @Post('availability')
  setAvailability(
    @Request() req,
    @Body('date') date: string,
    @Body('isAvailable') isAvailable: boolean,
    @Body('notes') notes?: string,
  ) {
    return this.staffOpsService.setAvailability(req.user.userId, date, isAvailable, notes);
  }

  @Roles('staff')
  @Post('incident')
  reportIncident(
    @Request() req,
    @Body('bookingId') bookingId: number,
    @Body('description') description: string,
    @Body('severity') severity: 'low' | 'medium' | 'high',
    @Body('photoUrls') photoUrls: string[] = [],
  ) {
    return this.staffOpsService.reportIncident(req.user.userId, bookingId, description, severity, photoUrls);
  }

  // Staff earnings: their own payouts
  @Roles('staff')
  @Get('payouts')
  async getMyPayouts(@Request() req) {
    const staff = await this.prisma.staff.findUnique({ where: { userId: req.user.userId } });
    if (!staff) return [];
    return this.prisma.staffPayout.findMany({
      where: { staffId: staff.id },
      orderBy: { periodStart: 'desc' },
    });
  }
}
