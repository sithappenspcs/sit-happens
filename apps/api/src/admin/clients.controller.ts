import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/clients')
export class AdminClientsController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles('admin')
  @Get()
  getAllClients() {
    return this.prisma.client.findMany({ include: { user: true, pets: true } });
  }

  @Roles('admin')
  @Get(':id')
  getClientById(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.client.findUnique({ where: { id }, include: { user: true, pets: true } });
  }

  @Roles('admin')
  @Patch(':id')
  updateClient(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.prisma.client.update({ where: { id }, data });
  }
}
