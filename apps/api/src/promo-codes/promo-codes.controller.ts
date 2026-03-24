import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Prisma } from '@sit-happens/db';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private service: PromoCodesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() data: Prisma.PromoCodeCreateInput) { return this.service.create(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: Prisma.PromoCodeUpdateInput) { return this.service.update(+id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.delete(+id); }
}
