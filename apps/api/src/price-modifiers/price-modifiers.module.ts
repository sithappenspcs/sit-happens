import { Module } from '@nestjs/common';
import { PriceModifiersService } from './price-modifiers.service';
import { PriceModifiersController } from './price-modifiers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PriceModifiersService],
  controllers: [PriceModifiersController],
  exports: [PriceModifiersService],
})
export class PriceModifiersModule {}
