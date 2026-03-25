import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const url = process.env.DATABASE_URL || 'postgresql://postgres:J45m1n3l31gh1%212%3F@db.ppseocjemrekuuuzxodu.supabase.co:5432/postgres';
  console.log('Testing connection to:', url.replace(/:[^:]+@/, ':****@'));
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log('✅ Connection successful!');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Successfully queried users:', users.length);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
