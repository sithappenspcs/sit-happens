import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AppGateway } from '../../gateway/app.gateway';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkActiveBookings() {
    this.logger.log('Running constraint monitor check...');

    const activeBookings = await this.prisma.booking.findMany({
      where: { status: 'active' },
      include: {
        package: true,
        staff: { include: { user: true } },
        client: { include: { user: true } },
        visitCheckIns: {
          where: { type: { in: ['check_in', 'update'] } },
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const now = new Date();

    for (const booking of activeBookings) {
      if (!booking.package || !booking.package.maxAbsenceMinutes) continue;

      const lastCheckIn = booking.visitCheckIns[0];
      if (!lastCheckIn) continue;

      const elapsedMinutes = Math.floor((now.getTime() - lastCheckIn.timestamp.getTime()) / 60000);
      const limit = booking.package.maxAbsenceMinutes;
      
      const threshold80 = Math.floor(limit * 0.8);

      if (elapsedMinutes >= limit) {
        // BREACH
        this.gateway.notifyAdmin('constraint:breach', {
          bookingId: booking.id,
          staffName: booking.staff?.user.name,
          clientName: booking.client.user.name,
          elapsedMinutes,
          limit
        });
        
        if (booking.staffId) {
            this.gateway.notifyStaff(booking.staffId, 'constraint:breach', {
                bookingId: booking.id,
                message: `URGENT: Absence limit reached (${limit}m). Please return immediately.`
            });
        }
      } else if (elapsedMinutes >= threshold80) {
        // WARNING
        this.gateway.notifyAdmin('constraint:warning', {
          bookingId: booking.id,
          staffName: booking.staff?.user.name,
          clientName: booking.client.user.name,
          elapsedMinutes,
          limit
        });

        if (booking.staffId) {
            this.gateway.notifyStaff(booking.staffId, 'constraint:warning', {
                bookingId: booking.id,
                message: `Reminder: You must return to ${booking.client.user.name}'s pet soon. ${limit - elapsedMinutes}m remaining.`
            });
        }
      }
    }
  }
}
