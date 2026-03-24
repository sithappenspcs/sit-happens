import { Module } from '@nestjs/common';
import { PriceModifiersService } from './price-modifiers.service';
import { PriceModifiersController } from './price-modifiers.controller';

@Module({
  providers: [PriceModifiersService],
  controllers: [PriceModifiersController],
  exports: [PriceModifiersService],
})
export class PriceModifiersModule {}
