import { Controller, Post, Body, UnauthorizedException, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    const { name, email, password, role } = body;
    if (!name || !email || !password) {
      throw new UnauthorizedException('Name, email, and password are required');
    }
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new UnauthorizedException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    // Use authService.register so it auto-creates the role profile
    const user = await this.authService.register(name, email, passwordHash, role || 'client');
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('magic-link')
  async requestMagicLink(@Body('email') email: string) {
    return this.authService.generateMagicLink(email);
  }

  @Post('magic-link/verify')
  async verifyMagicLink(@Body('token') token: string) {
    return this.authService.validateMagicLink(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept-terms')
  async acceptTerms(@Request() req, @Body('version') version: string) {
    return this.usersService.logTermsAcceptance(req.user.userId, version, req.ip);
  }
}
