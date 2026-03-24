import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Prisma } from '@sit-happens/db';

@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get()
  async findAll() {
    return this.packagesService.findAllActive();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.packagesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() data: Prisma.ServicePackageCreateInput) {
    return this.packagesService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.ServicePackageUpdateInput) {
    return this.packagesService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.packagesService.softDelete(+id);
  }
}
