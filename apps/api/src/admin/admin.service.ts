import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../payments/stripe/stripe.service';
import { CalendarService } from '../calendar/calendar.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private calendarService: CalendarService,
    private notificationsService: NotificationsService
  ) {}

  async approveBooking(bookingId: number, staffId: number, adminUserId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, client: { include: { user: true } } }
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'pending') throw new BadRequestException('Only pending bookings can be approved');

    // 1. Capture Stripe Payment (skip if no real intent, e.g. dev mode)
    const payment = booking.payment;
    if (payment && payment.stripePaymentIntentId && payment.status === 'pending'
        && payment.stripePaymentIntentId !== 'no_stripe_key') {
      try {
        await this.stripeService.capturePaymentIntent(payment.stripePaymentIntentId);
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'captured', capturedAt: new Date() },
        });
      } catch (e) {
        // Log but don't block — admin can retry manually
        console.error('Stripe capture failed:', e.message);
      }
    }

    // 2. Assign Sitter & Update Status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        staffId,
        status: 'approved',
        approvedBy: adminUserId,
        approvedAt: new Date()
      }
    });

    // 3. Sync to Google Calendar
    try {
      await this.calendarService.syncBookingToCalendar(bookingId);
    } catch (e) {
      console.error('Failed to sync to Google Calendar:', e);
    }

    // 4. Notifications
    await this.notificationsService.notifyUser(booking.client.userId, 'booking_approved', 'EMAIL_BOOKING_APPROVED', {
      clientName: booking.client.user.name,
      startTime: booking.startTime.toLocaleString()
    }, ['email', 'in_app']);

    if (staffId) {
      const staffRecord = await this.prisma.staff.findUnique({
        where: { id: staffId },
        include: { user: true },
      });
      if (staffRecord) {
        await this.notificationsService.notifyUser(staffRecord.userId, 'job_assigned', 'EMAIL_JOB_ASSIGNED', {
          staffName: staffRecord.user.name,
          startTime: booking.startTime.toLocaleString(),
          address: booking.client.address || 'address on file',
        }, ['email', 'in_app']);
      }
    }

    return updatedBooking;
  }

  async declineBooking(bookingId: number, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, client: { include: { user: true } } }
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'pending') throw new BadRequestException('Only pending bookings can be declined');

    // 1. Cancel Stripe Payment Attempt
    const payment = booking.payment;
    if (payment && payment.stripePaymentIntentId && payment.status === 'pending') {
      try {
        await this.stripeService.cancelPaymentIntent(payment.stripePaymentIntentId);
        
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'failed' } 
        });
      } catch (e) {
        throw new BadRequestException('Failed to cancel payment authorization');
      }
    }

    // 2. Cancel Booking
    const cancelledBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'declined',
        adminNotes: reason,
        cancellationReason: reason,
        cancelledAt: new Date()
      }
    });

    // 3. Notifications
    await this.notificationsService.notifyUser(booking.client.userId, 'booking_declined', 'EMAIL_BOOKING_DECLINED', {
      clientName: booking.client.user.name,
      reason: reason || 'Scheduling conflict'
    }, ['email', 'in_app']);

    return cancelledBooking;
  }

  async modifyBooking(bookingId: number, data: any) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data
    });
  }

  async refundBooking(bookingId: number, amountStr?: string) {
    const amountToRefund = amountStr ? Number(amountStr) : undefined;
    
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true }
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const payment = booking.payment;
    if (!payment || !payment.stripePaymentIntentId) {
      throw new BadRequestException('No Stripe payment found for this booking');
    }

    if (payment.status !== 'captured') {
        throw new BadRequestException('Payment has not been captured yet. Use decline for pending authorizations.');
    }

    // Process refund via Stripe
    await this.stripeService.refundPayment(payment.stripePaymentIntentId, amountToRefund);

    // Update booking/payment status in DB
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled', cancelledAt: new Date(), cancellationReason: 'Refund processed' }
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'refunded',
        refundAmount: amountToRefund || payment.amount 
      }
    });

    return { success: true };
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        client: { include: { user: true } },
        package: true,
        staff: { include: { user: true } }
      },
      orderBy: { startTime: 'desc' }
    });
  }

  async getAllPayouts() {
    return this.prisma.staffPayout.findMany({
      include: { staff: { include: { user: true } } },
      orderBy: { periodStart: 'desc' }
    });
  }

  async getDashboardKpis() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pendingBookings, activeStaff, newClients, revenueData] = await Promise.all([
      this.prisma.booking.count({ where: { status: 'pending' } }),
      this.prisma.staff.count({ where: { isActive: true } }),
      this.prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.payment.aggregate({
        where: {
          status: 'captured',
          capturedAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      pendingBookings,
      activeStaff,
      newClientsThisMonth: newClients,
      revenueThisMonth: revenueData._sum.amount || 0
    };
  }
}
