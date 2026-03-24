import { Module } from '@nestjs/common';
import { PetProfilesController } from './pet-profiles.controller';
import { PetProfilesService } from './pet-profiles.service';

@Module({
  controllers: [PetProfilesController],
  providers: [PetProfilesService]
})
export class PetProfilesModule {}
