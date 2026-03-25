import { Module } from '@nestjs/common';
import { StaffOperationsService } from './staff-operations.service';
import { StaffOperationsController } from './staff-operations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PrismaModule, NotificationsModule, GatewayModule],
  controllers: [StaffOperationsController],
  providers: [StaffOperationsService],
})
export class StaffOperationsModule {}
