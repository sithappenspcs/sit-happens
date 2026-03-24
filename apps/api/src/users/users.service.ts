import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@sit-happens/db';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async updateAuthTokens(id: number, magicLinkToken: string | null, magicLinkExpires: Date | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { magicLinkToken, magicLinkExpires }
    });
  }

  async findByMagicLinkToken(token: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { magicLinkToken: token }
    });
  }

  async logTermsAcceptance(userId: number, version: string, ipAddress?: string) {
    return this.prisma.termsAcceptanceLog.create({
      data: {
        userId,
        termsVersion: version,
        ipAddress
      }
    });
  }
}
