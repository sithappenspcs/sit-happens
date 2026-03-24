import { Controller, Get, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/staff')
export class AdminStaffController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles('admin')
  @Get()
  getAllStaff() {
    return this.prisma.staff.findMany({ include: { user: true } });
  }

  @Roles('admin')
  @Get(':id')
  getStaffById(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.staff.findUnique({ where: { id }, include: { user: true } });
  }

  @Roles('admin')
  @Patch(':id')
  updateStaff(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.prisma.staff.update({ where: { id }, data });
  }

  @Roles('admin')
  @Delete(':id')
  archiveStaff(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.staff.update({ where: { id }, data: { isActive: false } });
  }
}
