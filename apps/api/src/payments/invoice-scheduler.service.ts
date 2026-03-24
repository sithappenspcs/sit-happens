import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InvoiceSchedulerService {
  private readonly logger = new Logger(InvoiceSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueInvoices() {
    this.logger.log('Running daily overdue invoice check...');
    
    const now = new Date();
    
    // Find invoices that are issued but past their due date
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: ['issued'] },
        dueAt: { lt: now }
      },
      include: { client: { include: { user: true } } }
    });

    if (overdueInvoices.length === 0) {
      this.logger.log('No overdue invoices found.');
      return;
    }

    for (const invoice of overdueInvoices) {
      this.logger.log(`Marking invoice BK-${invoice.bookingId} as overdue and notifying client.`);

      // 1. Update status to overdue
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'overdue' }
      });

      // 2. Notify client
      await this.notificationsService.notifyUser(invoice.client.userId, 'invoice_overdue', 'EMAIL_INVOICE_OVERDUE', {
        clientName: invoice.client.user.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total.toString(),
        dueDate: invoice.dueAt?.toLocaleDateString()
      }, ['email', 'in_app']);
    }

    this.logger.log(`Processed ${overdueInvoices.length} overdue invoices.`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkUpcomingInvoices() {
    // Optional: Send reminders for invoices due in 24-48 hours
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    
    const upcoming = await this.prisma.invoice.findMany({
        where: {
            status: 'issued',
            dueAt: { lte: soon, gte: new Date() }
        },
        include: { client: { include: { user: true } } }
    });

    for (const inv of upcoming) {
        await this.notificationsService.notifyUser(inv.client.userId, 'invoice_reminder', 'EMAIL_INVOICE_REMINDER', {
            clientName: inv.client.user.name,
            dueDate: inv.dueAt?.toLocaleDateString()
        }, ['email']);
    }
  }
}
