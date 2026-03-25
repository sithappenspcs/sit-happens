import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly config: ConfigService,
  ) {}

  @Get('connect')
  @UseGuards(AuthGuard('google-calendar'))
  async connect() {
    // Passport redirects to Google — no body needed
  }

  @Get('callback')
  @UseGuards(AuthGuard('google-calendar'))
  async callback(@Req() req, @Res() res) {
    const oauthUser = req.user;
    if (!oauthUser?.accessToken) {
      return res.redirect(`${this.config.get('FRONTEND_URL')}/admin/staff?calendar=error`);
    }

    // The state param carries the userId who initiated the connect flow.
    // Fallback: parse from cookie set before redirect (handled client-side).
    const userId = req.query?.state ? parseInt(req.query.state as string, 10) : null;
    if (!userId) {
      return res.redirect(`${this.config.get('FRONTEND_URL')}/admin/staff?calendar=error&reason=missing_user`);
    }

    const expiryDate = new Date(Date.now() + 3600 * 1000);
    await this.calendarService.storeTokens(
      userId,
      oauthUser.email,
      oauthUser.accessToken,
      oauthUser.refreshToken,
      expiryDate,
    );

    try {
      await this.calendarService.registerWebhook(userId);
    } catch (e) {
      console.error('Webhook registration failed:', e);
    }

    return res.redirect(`${this.config.get('FRONTEND_URL')}/admin/staff?calendar=connected`);
  }

  @Post('webhook')
  async handleWebhook(@Req() req) {
    const channelId = req.headers['x-goog-channel-id'] as string;
    const resourceId = req.headers['x-goog-resource-id'] as string;
    if (channelId && resourceId) {
      await this.calendarService.handleWebhook(channelId, resourceId);
    }
    return { success: true };
  }
}
