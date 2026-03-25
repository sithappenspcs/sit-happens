import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../payments/stripe/stripe.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private notificationsService: NotificationsService,
  ) {}

  private async getClientByUserId(userId: number) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!client) throw new NotFoundException('Client profile not found. Please complete your account setup.');
    return client;
  }

  async create(data: any) {
    const client = await this.getClientByUserId(data.userId);

    const servicePackage = await this.prisma.servicePackage.findUnique({ where: { id: data.packageId } });
    if (!servicePackage) throw new NotFoundException('Service package not found');

    const basePrice = Number(servicePackage.basePrice);

    // Create Stripe PaymentIntent (pre-auth / manual capture)
    let intentId = 'no_stripe_key';
    let clientSecret: string | null = null;
    try {
      const intent = await this.stripe.createPaymentIntent(basePrice, 'cad');
      intentId = intent.id;
      clientSecret = intent.client_secret;
    } catch (e) {
      // Stripe not configured in dev — continue without payment
      console.warn('Stripe not configured, skipping payment intent creation');
    }

    const booking = await this.prisma.booking.create({
      data: {
        clientId: client.id,
        packageId: data.packageId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        petIds: data.petIds || [],
        status: 'pending',
        basePrice,
        totalCharged: basePrice,
        clientNotes: data.clientNotes,
        ...(intentId !== 'no_stripe_key' && {
          payment: {
            create: {
              stripePaymentIntentId: intentId,
              amount: basePrice,
              status: 'pending',
            },
          },
        }),
      },
      include: { payment: true },
    });

    // Find admin user to notify
    const adminUser = await this.prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser) {
      await this.notificationsService.notifyUser(adminUser.id, 'new_booking_request', 'EMAIL_NEW_BOOKING_ADMIN', {
        clientName: client.user.name,
        packageName: servicePackage.name,
        startTime: booking.startTime.toLocaleString(),
      }, ['email', 'in_app']);
    }

    return { booking, clientSecret };
  }

  async findByUserId(userId: number) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) return [];
    return this.prisma.booking.findMany({
      where: { clientId: client.id },
      include: { package: true, staff: { include: { user: true } } },
      orderBy: { startTime: 'desc' },
    });
  }

  async cancelByUserId(bookingId: number, userId: number) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw new NotFoundException('Client profile not found');

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, clientId: client.id },
      include: { payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // Cancel Stripe intent if it's pending (not yet captured)
    if (booking.payment?.stripePaymentIntentId && booking.payment.status === 'pending') {
      try {
        await this.stripe.cancelPaymentIntent(booking.payment.stripePaymentIntentId);
        await this.prisma.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'failed' },
        });
      } catch (e) {
        console.warn('Could not cancel Stripe intent:', e);
      }
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }
}
