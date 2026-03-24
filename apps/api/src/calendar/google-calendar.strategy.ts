import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleCalendarStrategy extends PassportStrategy(Strategy, 'google-calendar') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALENDAR_REDIRECT_URI'),
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
      accessType: 'offline',
      prompt: 'consent',
    } as any);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { emails } = profile;
    const user = {
      email: emails[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
