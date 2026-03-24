import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../payments/stripe/stripe.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private notificationsService: NotificationsService
  ) {}

  async create(data: any) {
    // Get client by userId
    const client = await this.prisma.client.findUnique({ 
      where: { userId: data.userId },
      include: { user: true }
    });
    if (!client) throw new NotFoundException('Client profile not found');

    // Get package base price
    const servicePackage = await this.prisma.servicePackage.findUnique({ where: { id: data.packageId } });
    if (!servicePackage) throw new NotFoundException('Package not found');
    const basePrice = Number(servicePackage.basePrice);

    // Create Stripe PaymentIntent for pre-auth
    const intent = await this.stripe.createPaymentIntent(basePrice, 'cad');

    // Create Booking and nested Payment
    const booking = await this.prisma.booking.create({
      data: {
        clientId: client.id,
        packageId: data.packageId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: 'pending',
        basePrice,
        totalCharged: basePrice,
        payment: {
          create: {
            stripePaymentIntentId: intent.id,
            amount: basePrice,
            status: 'pending'
          }
        }
      },
      include: { payment: true }
    });

    // Notify Admin of new request
    await this.notificationsService.notifyUser(1, 'new_booking_request', 'EMAIL_NEW_BOOKING_ADMIN', {
      clientName: client.user.name,
      packageName: servicePackage.name,
      startTime: booking.startTime.toLocaleString()
    }, ['email', 'in_app']);

    return { booking, clientSecret: intent.client_secret };
  }

  async findByClient(clientId: number) {
    return this.prisma.booking.findMany({
      where: { clientId },
      include: { package: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async cancelByClient(id: number, clientId: number) {
    const booking = await this.prisma.booking.findFirst({ where: { id, clientId } });
    if (!booking) throw new NotFoundException('Booking not found');
    
    // In real flow: cancel Stripe intent if it's strictly pre-auth and not captured.
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
