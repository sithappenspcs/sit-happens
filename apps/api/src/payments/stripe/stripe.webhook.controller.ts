import { Controller, Post, Headers, Req, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService
  ) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event;
    try {
      // NestJS needs req.rawBody configured in main.ts
      const rawBody = req.rawBody || req.body; 
      event = await this.stripeService.constructEventFromPayload(rawBody, signature);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as any;
        await this.handlePaymentIntentSucceeded(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as any;
        await this.handlePaymentIntentFailed(failedIntent);
        break;

      case 'charge.refunded':
        const charge = event.data.object as any;
        await this.handleChargeRefunded(charge);
        break;

      default:
        // Unhandled event type
        break;
    }

    return { received: true };
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { booking: { include: { client: true } } }
    });

    if (!payment) return; // Not tracked by our system or already processed

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'captured',
        capturedAt: new Date(),
        amount: paymentIntent.amount_received / 100 // Stripe amounts are in cents
      }
    });

    // Generate Invoice if it doesn't exist
    const invoiceExists = await this.prisma.invoice.findUnique({ where: { bookingId: payment.bookingId } });
    if (!invoiceExists) {
      const taxRate = 0.05; // 5% GST (Alberta)
      const subtotal = Number(payment.booking.basePrice);
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      await this.prisma.invoice.create({
        data: {
          bookingId: payment.bookingId,
          clientId: payment.booking.clientId,
          invoiceNumber: `INV-${new Date().getFullYear()}-${payment.bookingId.toString().padStart(4, '0')}`,
          lineItems: [{ description: 'Pet Care Services', amount: subtotal }],
          subtotal,
          taxRate,
          taxAmount,
          total,
          status: 'paid', // Automatically paid since it succeeded
          issuedAt: new Date(),
          paidAt: new Date()
        }
      });
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'failed' }
    });
  }

  private async handleChargeRefunded(charge: any) {
    if (!charge.payment_intent) return;
    
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent }
    });

    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'refunded',
        refundAmount: charge.amount_refunded / 100
      }
    });
  }
}
