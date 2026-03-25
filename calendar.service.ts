import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CalendarService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'your_jwt_secret_here_change_in_production';
    this.key = crypto.scryptSync(secret, 'salt', 32);
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    const [ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async storeTokens(userId: number, email: string, accessToken: string, refreshToken: string, expiryDate: Date) {
    const accessTokenEnc = this.encrypt(accessToken);
    const refreshTokenEnc = refreshToken ? this.encrypt(refreshToken) : undefined;

    return this.prisma.googleCalendarToken.upsert({
      where: { userId },
      update: {
        googleAccountEmail: email,
        accessTokenEnc,
        ...(refreshTokenEnc && { refreshTokenEnc }),
        tokenExpiry: expiryDate,
        isActive: true
      },
      create: {
        userId,
        googleAccountEmail: email,
        accessTokenEnc,
        refreshTokenEnc: refreshTokenEnc || '',
        tokenExpiry: expiryDate
      }
    });
  }

  async getValidToken(userId: number): Promise<string | null> {
    const tokens = await this.prisma.googleCalendarToken.findUnique({ where: { userId } });
    if (!tokens) return null;

    if (tokens.tokenExpiry > new Date()) {
      return this.decrypt(tokens.accessTokenEnc);
    }

    if (!tokens.refreshTokenEnc) return null;

    const decryptedRefresh = this.decrypt(tokens.refreshTokenEnc);
    return this.refreshToken(userId, decryptedRefresh);
  }

  private async refreshToken(userId: number, refreshToken: string): Promise<string | null> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Google OAuth credentials not configured');
    }

    // Manually refresh using google's oauth endpoint if googleapis isn't used
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId as string,
        client_secret: clientSecret as string,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    const data = await response.json();
    if (!response.ok) return null;

    const expiryDate = new Date(Date.now() + data.expires_in * 1000);
    await this.storeTokens(userId, '', data.access_token, refreshToken, expiryDate);

    return data.access_token;
  }

  async syncBookingToCalendar(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        client: { include: { user: true } },
        staff: { include: { user: true } },
        package: true
      }
    });

    if (!booking) return;

    // Sync for Admin (userId 1 assumed) and Staff
    const targetUserIds = [1];
    if (booking.staff?.userId) targetUserIds.push(booking.staff.userId);

    for (const userId of targetUserIds) {
      const accessToken = await this.getValidToken(userId);
      if (!accessToken) continue;

      const event = {
        summary: `Pet Care: ${booking.client.user.name} (${booking.package.name})`,
        description: `Booking ID: ${booking.id}\nNotes: ${booking.clientNotes || 'None'}`,
        start: { dateTime: booking.startTime.toISOString() },
        end: { dateTime: booking.endTime.toISOString() },
        location: booking.client.address || '',
      };

      // Create or update event
      const existingMap = await this.prisma.calendarEventMap.findUnique({
        where: { bookingId_userId: { bookingId, userId } }
      });

      const url = existingMap 
        ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingMap.googleEventId}`
        : `https://www.googleapis.com/calendar/v3/calendars/primary/events`;

      const method = existingMap ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      const gData = await res.json();
      if (res.ok) {
        await this.prisma.calendarEventMap.upsert({
          where: { bookingId_userId: { bookingId, userId } },
          update: { googleEventId: gData.id, lastSyncedAt: new Date(), syncDirection: 'push' },
          create: { bookingId, userId, googleEventId: gData.id, calendarId: 'primary', syncDirection: 'push' }
        });
      }
    }
  }

  async registerWebhook(userId: number) {
    const accessToken = await this.getValidToken(userId);
    if (!accessToken) return;

    const channelId = crypto.randomUUID();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/watch`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: `${this.configService.get('API_URL')}/calendar/webhook`,
        params: { ttl: '604800' } // 7 days
      })
    });

    const data = await res.json();
    if (res.ok) {
      await this.prisma.googleCalendarToken.update({
        where: { userId },
        data: {
          webhookChannelId: channelId,
          webhookExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  async handleWebhook(channelId: string, resourceId: string) {
    const tokens = await this.prisma.googleCalendarToken.findFirst({
      where: { webhookChannelId: channelId }
    });
    if (!tokens) return;

    const accessToken = await this.getValidToken(tokens.userId);
    if (!accessToken) return;

    // Fetch changes and update SitterAvailability (Simplified: fetch last 24h of events)
    const timeMin = new Date().toISOString();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const data = await res.json();
    if (res.ok && data.items) {
      for (const event of data.items) {
        if (!event.start || !event.end) continue;
        
        const eventDate = new Date(event.start.date || event.start.dateTime);
        
        // If it's a "busy" event (default is busy), we mark as NOT available
        // Note: Google Calendar API 'transparency' field: 'opaque' (busy) or 'transparent' (free)
        if (event.transparency === 'transparent') continue;

        await this.prisma.sitterAvailability.upsert({
          where: {
            staffId_date: {
              staffId: tokens.userId, // Assuming staffId matches userId for simplicity in MVP or lookup needed
              date: eventDate
            }
          },
          update: {
            isAvailable: false,
            source: 'google_calendar',
            googleEventId: event.id,
            notes: event.summary
          },
          create: {
            staffId: tokens.userId,
            date: eventDate,
            isAvailable: false,
            source: 'google_calendar',
            googleEventId: event.id,
            notes: event.summary
          }
        });
      }

      await this.prisma.calendarSyncLog.create({
        data: {
          userId: tokens.userId,
          action: 'pull_block',
          details: { count: data.items.length }
        }
      });
    }
  }
}
