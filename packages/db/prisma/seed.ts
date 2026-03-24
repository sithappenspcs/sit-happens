import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');
  
  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sithappens.ca' },
    update: {},
    create: {
      email: 'admin@sithappens.ca',
      name: 'Sit Happens Admin',
      role: 'admin',
      passwordHash: '$2a$10$wE9sY6Z5N7mH1T1h9l9y9OQh/2fR/y/qL7M/Oq8U0E3X7D1z0Q0zG', // admin123
      isActive: true,
    },
  });

  console.log('Created Admin:', admin.email);

  // 2. Service Packages
  const dropIn = await prisma.servicePackage.upsert({
    where: { slug: 'standard-drop-in' },
    update: {},
    create: {
      name: 'Standard Drop-In Visit',
      slug: 'standard-drop-in',
      tagline: 'A quick visit for potty breaks and cuddles.',
      description: '30 minute visit including feeding, fresh water, and a short walk or playtime.',
      basePrice: 25.00,
      priceUnit: 'per_visit',
      durationMinutes: 30,
      category: 'drop_in',
      isOvernight: false,
      constraintType: 'absence_window',
      maxAbsenceMinutes: 240,
      allowsConcurrentBookings: true,
      isActive: true,
      displayOrder: 1,
    },
  });
  console.log('Created Package:', dropIn.name);

  const houseSit = await prisma.servicePackage.upsert({
    where: { slug: 'premium-house-sit' },
    update: {},
    create: {
      name: 'Premium House Sitting',
      slug: 'premium-house-sit',
      tagline: 'Overnight care in your home.',
      description: "The sitter stays overnight and maintains your pet's complete routine.",
      basePrice: 95.00,
      priceUnit: 'per_night',
      durationMinutes: 1440, // 24 hours
      category: 'house_sit',
      isOvernight: true,
      constraintType: 'continuous_presence',
      maxAbsenceMinutes: 240,
      allowsConcurrentBookings: false,
      isActive: true,
      displayOrder: 2,
    },
  });
  console.log('Created Package:', houseSit.name);
  
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
