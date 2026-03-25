import { Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { StripeWebhookController } from './stripe/stripe.webhook.controller';
import { InvoiceSchedulerService } from './invoice-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [StripeWebhookController],
  providers: [StripeService, InvoiceSchedulerService],
  exports: [StripeService, InvoiceSchedulerService],
})
export class PaymentsModule {}
