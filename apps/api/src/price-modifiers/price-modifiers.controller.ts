import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PriceModifiersService } from './price-modifiers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Prisma } from '@sit-happens/db';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('price-modifiers')
export class PriceModifiersController {
  constructor(private service: PriceModifiersService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() data: Prisma.PriceModifierCreateInput) { return this.service.create(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: Prisma.PriceModifierUpdateInput) { return this.service.update(+id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.delete(+id); }
}
