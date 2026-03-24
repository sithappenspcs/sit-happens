import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffPayoutsService {
  constructor(private prisma: PrismaService) {}

  async generatePayouts(periodStart: string, periodEnd: string) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    // Find all completed bookings in period that aren't already part of a payout
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'completed',
        startTime: { gte: start, lte: end },
        staffPayoutId: null,
      },
      select: {
        id: true,
        staffId: true,
        staffPayout: true
      }
    });

    if (bookings.length === 0) {
      return { count: 0, message: 'No unstructured completed bookings found for this period.' };
    }

    const grouped = bookings.reduce((acc, booking) => {
      const sid = booking.staffId;
      if (!sid) return acc;
      if (!acc[sid]) acc[sid] = { total: 0, bookingIds: [] };
      acc[sid].total += Number(booking.staffPayout || 0);
      acc[sid].bookingIds.push(booking.id);
      return acc;
    }, {} as Record<number, { total: number, bookingIds: number[] }>);

    const createdPayouts: any[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const [staffId, data] of Object.entries(grouped)) {
        if (data.total <= 0) continue;

        const payout = await tx.staffPayout.create({
          data: {
            staffId: Number(staffId),
            periodStart: start,
            periodEnd: end,
            totalEarned: data.total,
            status: 'pending',
            bookingIds: data.bookingIds,
            bookings: {
              connect: data.bookingIds.map(id => ({ id }))
            }
          }
        });

        createdPayouts.push(payout);
      }
    });

    return { count: createdPayouts.length, payouts: createdPayouts };
  }

  async getPayouts() {
    return this.prisma.staffPayout.findMany({
      include: { staff: { include: { user: true } } },
      orderBy: { periodStart: 'desc' }
    });
  }

  async markPaid(payoutId: number) {
    const payout = await this.prisma.staffPayout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Payout record not found');
    if (payout.status === 'paid') throw new BadRequestException('Payout is already paid');

    return this.prisma.staffPayout.update({
      where: { id: payoutId },
      data: {
        status: 'paid',
        paidAt: new Date()
      }
    });
  }
}
