import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StaffPayoutsService } from './staff-payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/payouts')
export class StaffPayoutsController {
  constructor(private readonly service: StaffPayoutsService) {}

  @Get()
  getPayouts() {
    return this.service.getPayouts();
  }

  @Post('generate')
  generatePayouts(
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string
  ) {
    return this.service.generatePayouts(periodStart, periodEnd);
  }

  @Post(':id/mark-paid')
  markPaid(@Param('id', ParseIntPipe) id: number) {
    return this.service.markPaid(id);
  }
}
