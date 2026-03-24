import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2026-02-25.clover', // Latest API version
    });
  }

  async createPaymentIntent(amountStr: string | number, currency = 'cad') {
    const amount = Number(amountStr);
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency,
      capture_method: 'manual', // Pre-authorization only
    });
  }

  async constructEventFromPayload(payload: any, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
    return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  }

  async cancelPaymentIntent(intentId: string) {
    return this.stripe.paymentIntents.cancel(intentId);
  }

  async refundPayment(intentId: string, amount?: number) {
    const params: Stripe.RefundCreateParams = { payment_intent: intentId };
    if (amount) params.amount = Math.round(amount * 100);
    return this.stripe.refunds.create(params);
  }

  async capturePaymentIntent(intentId: string, amountToCapture?: number) {
    const params = amountToCapture ? { amount_to_capture: Math.round(amountToCapture * 100) } : undefined;
    return this.stripe.paymentIntents.capture(intentId, params);
  }
}
