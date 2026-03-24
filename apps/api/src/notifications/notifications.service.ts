import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private gateway: AppGateway
  ) {}

  private async getTemplate(key: string, data: Record<string, any>): Promise<{ subject: string; body: string }> {
    const setting = await this.prisma.siteSetting.findUnique({ where: { key } });
    let template = setting?.value || `Missing template for ${key}. Data: ${JSON.stringify(data)}`;
    
    // Simple interpolation: {{key}} -> data[key]
    Object.entries(data).forEach(([k, v]) => {
      template = template.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });

    const lines = template.split('\n');
    const subject = lines[0].startsWith('Subject: ') ? lines[0].replace('Subject: ', '') : 'Notification';
    const body = lines.slice(1).join('\n');

    return { subject, body };
  }

  async sendEmail(to: string, templateKey: string, data: Record<string, any>) {
    const { subject, body } = await this.getTemplate(templateKey, data);
    
    this.logger.log(`Sending Email to ${to}: [${subject}]`);
    
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Sit Happens <notifications@sithappens.ca>',
            to: [to],
            subject,
            html: body.replace(/\n/g, '<br>')
          })
        });
      } catch (e) {
        this.logger.error(`Failed to send email via Resend: ${e.message}`);
      }
    } else {
      this.logger.warn(`No RESEND_API_KEY configured. Email not sent.`);
    }
  }

  async notifyUser(userId: number, type: string, templateKey: string, data: Record<string, any>, channels: ('email' | 'in_app')[] = ['in_app']) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const { subject, body } = await this.getTemplate(templateKey, data);

    if (channels.includes('in_app')) {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          subject,
          body,
          channel: 'in_app'
        }
      });
      
      // Real-time Notification
      if (this.gateway && this.gateway.server) {
        this.gateway.server.to(`user:${userId}`).emit('notification:new', {
          id: notification.id,
          type,
          subject,
          body
        });
      }
    }

    if (channels.includes('email') && user.email) {
      await this.sendEmail(user.email, templateKey, data);
    }
  }

  async markAsRead(notificationId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() }
    });
  }

  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: 50
    });
  }
}
