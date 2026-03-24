import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/zones')
export class AdminZonesController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles('admin')
  @Get()
  getAllZones() {
    return this.prisma.zone.findMany();
  }

  @Roles('admin')
  @Post()
  createZone(@Body() data: any) {
    return this.prisma.zone.create({ data });
  }

  @Roles('admin')
  @Patch(':id')
  updateZone(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.prisma.zone.update({ where: { id }, data });
  }

  @Roles('admin')
  @Delete(':id')
  deleteZone(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.zone.update({ where: { id }, data: { isActive: false } });
  }
}
