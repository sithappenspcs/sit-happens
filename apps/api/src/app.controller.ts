import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  healthCheck() {
    return { status: 'ok', service: 'Sit Happens API', timestamp: new Date().toISOString() };
  }

  @Post('contact')
  async submitContact(@Body() body: {
    name: string;
    email: string;
    message?: string;
    address?: string;
  }) {
    if (!body.email || !body.name) {
      return { success: false, message: 'Name and email are required' };
    }
    await this.prisma.waitlistLead.create({
      data: {
        email: body.email,
        name: body.name,
        message: body.message,
        address: body.address,
      },
    });
    return { success: true, message: "Thanks! We'll be in touch within 24 hours." };
  }
}
