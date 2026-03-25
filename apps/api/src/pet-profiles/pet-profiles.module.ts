import { Module } from '@nestjs/common';
import { PetProfilesController } from './pet-profiles.controller';
import { PetProfilesService } from './pet-profiles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PetProfilesController],
  providers: [PetProfilesService]
})
export class PetProfilesModule {}
