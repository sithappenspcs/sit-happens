import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PackagesModule } from './packages/packages.module';
import { PriceModifiersModule } from './price-modifiers/price-modifiers.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { PetProfilesModule } from './pet-profiles/pet-profiles.module';
import { StaffOperationsModule } from './staff-operations/staff-operations.module';
import { StaffPayoutsModule } from './staff-payouts/staff-payouts.module';
import { CalendarModule } from './calendar/calendar.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    PackagesModule,
    PriceModifiersModule,
    PromoCodesModule,
    SchedulingModule,
    BookingsModule,
    PaymentsModule,
    AdminModule,
    PetProfilesModule,
    StaffOperationsModule,
    StaffPayoutsModule,
    CalendarModule,
    NotificationsModule,
    GatewayModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
