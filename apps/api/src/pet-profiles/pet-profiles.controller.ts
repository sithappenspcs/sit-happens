import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { PetProfilesService } from './pet-profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pets')
export class PetProfilesController {
  constructor(private readonly petProfilesService: PetProfilesService) {}

  @Roles('client')
  @Post()
  create(@Request() req, @Body() createPetDto: any) {
    return this.petProfilesService.create(req.user.userId, createPetDto);
  }

  @Roles('client')
  @Get()
  findAllByClient(@Request() req) {
    return this.petProfilesService.findAllByClientUserId(req.user.userId);
  }

  @Roles('client')
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.petProfilesService.findOne(+id, req.user.userId);
  }

  @Roles('client')
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updatePetDto: any) {
    return this.petProfilesService.update(+id, req.user.userId, updatePetDto);
  }

  @Roles('client')
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.petProfilesService.remove(+id, req.user.userId);
  }
}
