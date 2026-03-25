import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@sit-happens/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    console.log('📡 PrismaService connecting...');
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'UNDEFINED');
    try {
      await this.$connect();
      console.log('✅ Prisma connected');
    } catch (e) {
      console.error('❌ Prisma connection failed:', e.message);
    }
  }
}
