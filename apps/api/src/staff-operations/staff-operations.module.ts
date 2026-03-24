import { Module } from '@nestjs/common';
import { StaffOperationsService } from './staff-operations.service';
import { StaffOperationsController } from './staff-operations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StaffOperationsController],
  providers: [StaffOperationsService],
})
export class StaffOperationsModule {}
