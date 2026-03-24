import { Module } from '@nestjs/common';
import { StaffPayoutsService } from './staff-payouts.service';
import { StaffPayoutsController } from './staff-payouts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StaffPayoutsController],
  providers: [StaffPayoutsService],
})
export class StaffPayoutsModule {}
