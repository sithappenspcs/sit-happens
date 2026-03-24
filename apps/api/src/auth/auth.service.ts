import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateOAuthUser(profile: any) {
    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        role: 'client',
        avatarUrl: profile.picture,
        isActive: true,
      });
    }
    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async generateMagicLink(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 mins expiry

    await this.usersService.updateAuthTokens(user.id, token, expires);

    // Send email
    await this.notificationsService.notifyUser(user.id, 'magic_link', 'EMAIL_MAGIC_LINK', {
      loginUrl: `${process.env.FRONTEND_URL}/auth/magic-link?token=${token}`
    }, ['email']);

    return { success: true };
  }

  async validateMagicLink(token: string) {
    const user = await this.usersService.findByMagicLinkToken(token);
    
    if (!user || !user.magicLinkExpires || user.magicLinkExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    // Invalidate token after one use
    await this.usersService.updateAuthTokens(user.id, null, null);

    return this.login(user);
  }
}
