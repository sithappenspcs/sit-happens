import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleCalendarStrategy extends PassportStrategy(Strategy, 'google-calendar') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALENDAR_REDIRECT_URI')
      || 'http://localhost:4000/api/v1/calendar/callback';

    super({
      // Use a dummy value if not configured so the app still boots
      clientID: clientID && clientID !== 'placeholder' ? clientID : 'not-configured',
      clientSecret: clientSecret && clientSecret !== 'placeholder' ? clientSecret : 'not-configured',
      callbackURL,
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
      accessType: 'offline',
      prompt: 'consent',
    } as any);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { emails } = profile;
    const user = { email: emails[0].value, accessToken, refreshToken };
    done(null, user);
  }
}
