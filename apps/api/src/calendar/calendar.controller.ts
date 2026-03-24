import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('connect')
  @UseGuards(AuthGuard('google-calendar'))
  async connect() {
    // Redirects to Google
  }

  @Get('callback')
  @UseGuards(AuthGuard('google-calendar'))
  async callback(@Req() req, @Res() res) {
    const user = req.user; 
    
    if (user && user.accessToken) {
      // In a real app, we'd linked this to the logged-in session user's ID.
      // For now, using a placeholder or extraction from session/JWT if available.
      const userId = req.user.id || 1; // Fallback to admin for testing
      const expiryDate = new Date(Date.now() + 3600 * 1000); // 1 hour default
      
      await this.calendarService.storeTokens(
        userId,
        user.email,
        user.accessToken,
        user.refreshToken,
        expiryDate
      );

      // Register webhook for real-time sync
      try {
        await this.calendarService.registerWebhook(userId);
      } catch (e) {
        console.error('Failed to register GCal webhook:', e);
      }
    }

    return res.redirect(`${process.env.FRONTEND_URL}/admin/staff?calendar=success`);
  }

  @Post('webhook')
  async handleWebhook(@Req() req) {
    const channelId = req.headers['x-goog-channel-id'];
    const resourceId = req.headers['x-goog-resource-id'];
    if (channelId && resourceId) {
       await this.calendarService.handleWebhook(channelId as string, resourceId as string);
    }
    return { success: true };
  }
}
