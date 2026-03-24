import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class StaffOperationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private gateway: AppGateway
  ) {}

  async getDashboard(userId: number) {
    const staff = await this.prisma.staff.findUnique({ where: { userId } });
    if (!staff) throw new NotFoundException('Staff profile not found');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayJobs = await this.prisma.booking.findMany({
      where: {
        staffId: staff.id,
        startTime: { gte: todayStart, lte: todayEnd },
        status: { in: ['approved', 'active'] }
      },
      include: {
        client: true,
        package: true
      },
      orderBy: { startTime: 'asc' }
    });

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const earningsAggr = await this.prisma.booking.aggregate({
      where: {
        staffId: staff.id,
        status: 'completed',
        startTime: { gte: monthStart }
      },
      _sum: { staffPayout: true }
    });

    return {
      todayJobs,
      earningsThisMonth: earningsAggr._sum.staffPayout || 0
    };
  }

  async getJobDetails(userId: number, bookingId: number) {
    const staff = await this.prisma.staff.findUnique({ where: { userId } });
    if (!staff) throw new NotFoundException('Staff profile not found');

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, staffId: staff.id },
      include: {
        client: {
          include: { pets: true }
        },
        package: true,
        visitCheckIns: true
      }
    });

    if (!booking) throw new NotFoundException('Job not found or unauthorized');
    
    // Convert petIds from the booking to full pet objects
    const bookedPets = booking.client.pets.filter(pet => booking.petIds.includes(pet.id));
    
    return { ...booking, bookedPets };
  }

  async checkIn(userId: number, bookingId: number, photoUrls: string[], note?: string) {
    const staff = await this.prisma.staff.findUnique({ where: { userId } });
    if (!staff) throw new NotFoundException('Staff not found');

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, staffId: staff.id, status: 'approved' }
    });

    if (!booking) throw new BadRequestException('Booking not ready for check-in');

    await this.prisma.$transaction([
      this.prisma.visitCheckIn.create({
        data: {
          bookingId,
          staffId: staff.id,
          type: 'check_in',
          photoUrls,
          note
        }
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'active' }
      })
    ]);

    // WebSocket trigger for real-time update to client
    if (this.gateway && this.gateway.server) {
        this.gateway.notifyClient(booking.clientId, 'visit:update', {
            bookingId,
            status: 'active',
            type: 'check_in',
            timestamp: new Date()
        });
    }

    return { success: true };
  }

  async checkOut(userId: number, bookingId: number, photoUrls: string[], note?: string) {
    const staff = await this.prisma.staff.findUnique({ where: { userId } });
    if (!staff) throw new NotFoundException('Staff not found');

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, staffId: staff.id, status: 'active' }
    });

    if (!booking) throw new BadRequestException('Booking is not active');

    await this.prisma.$transaction([
      this.prisma.visitCheckIn.create({
        data: {
          bookingId,
          staffId: staff.id,
          type: 'check_out',
          photoUrls,
          note
        }
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'completed' }
      })
    ]);

    // WebSocket trigger for real-time update to client
    if (this.gateway && this.gateway.server) {
        this.gateway.notifyClient(booking.clientId, 'visit:update', {
            bookingId,
            status: 'completed',
            type: 'check_out',
            timestamp: new Date()
        });
    }

    return { success: true };
  }

  async setAvailability(userId: number, date: string, isAvailable: boolean, notes?: string) {
    const staff = await this.prisma.staff.findUnique({ where: { userId } });
    if (!staff) throw new NotFoundException('Staff not found');

    const parsedDate = new Date(date);
    
    return this.prisma.sitterAvailability.upsert({
      where: {
        staffId_date: {
          staffId: staff.id,
          date: parsedDate
        }
      },
      update: { isAvailable, notes },
      create: { staffId: staff.id, date: parsedDate, isAvailable, notes }
    });
  }

  async reportIncident(userId: number, bookingId: number, description: string, severity: 'low' | 'medium' | 'high', photoUrls: string[] = []) {
    const staff = await this.prisma.staff.findUnique({ where: { userId }, include: { user: true } });
    if (!staff) throw new NotFoundException('Staff not found');

    const report = await this.prisma.incidentReport.create({
      data: {
        bookingId,
        staffId: staff.id,
        description,
        severity,
        photoUrls
      }
    });

    // Notify Admin of incident
    await this.notificationsService.notifyUser(1, 'new_incident', 'EMAIL_INCIDENT_REPORT_ADMIN', {
      staffName: staff.user.name,
      severity,
      description
    }, ['email', 'in_app']);

    return report;
  }
}
