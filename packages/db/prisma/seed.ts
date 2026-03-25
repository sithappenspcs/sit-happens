import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ──────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sithappens.ca' },
    update: {},
    create: {
      name: 'Sit Happens Admin',
      email: 'admin@sithappens.ca',
      role: 'admin',
      passwordHash: adminHash,
      isActive: true,
    },
  });
  console.log('✓ Admin user created:', adminUser.email);

  // ── Staff user ──────────────────────────────────────────────────
  const staffHash = await bcrypt.hash('staff123', 10);
  const staffUser = await prisma.user.upsert({
    where: { email: 'sarah@sithappens.ca' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'sarah@sithappens.ca',
      role: 'staff',
      passwordHash: staffHash,
      phone: '780-555-0101',
      isActive: true,
    },
  });
  const staffProfile = await prisma.staff.upsert({
    where: { userId: staffUser.id },
    update: {},
    create: {
      userId: staffUser.id,
      baseLocationLat: 53.5461,
      baseLocationLng: -113.4938,
      radiusKm: 20,
      commissionPct: 0.7,
      bio: 'Experienced pet sitter with 5+ years caring for dogs, cats, and small animals.',
      certifications: ['Pet First Aid', 'Dog Handler Certification'],
      isActive: true,
    },
  });
  console.log('✓ Staff user created:', staffUser.email);

  // ── Client user ──────────────────────────────────────────────────
  const clientHash = await bcrypt.hash('client123', 10);
  const clientUser = await prisma.user.upsert({
    where: { email: 'emma@example.com' },
    update: {},
    create: {
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'client',
      passwordHash: clientHash,
      phone: '780-555-0202',
      isActive: true,
    },
  });
  const clientProfile = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      address: '10116 104 Ave NW, Edmonton, AB T5J 0H8',
      locationLat: 53.5448,
      locationLng: -113.5052,
      emergencyContactName: 'James Wilson',
      emergencyContactPhone: '780-555-0303',
      creditBalance: 0,
      lifetimeValue: 0,
    },
  });
  console.log('✓ Client user created:', clientUser.email);

  // ── Pets for client ──────────────────────────────────────────────
  const existingPet1 = await prisma.pet.findFirst({ where: { clientId: clientProfile.id, name: 'Biscuit' } });
  const pet1 = existingPet1 ?? await prisma.pet.create({
    data: {
      clientId: clientProfile.id,
      name: 'Biscuit',
      species: 'Dog',
      breed: 'Golden Retriever',
      weightKg: 28,
      dob: new Date('2019-06-15'),
      vaccinationStatus: 'current',
      vaccinationExpiry: new Date('2026-06-15'),
      feedingInstructions: '1 cup of kibble twice daily, 8am and 5pm.',
      behavioralNotes: 'Friendly with all dogs. Loves fetch. Afraid of thunderstorms.',
      vetName: 'Dr. Patel',
      vetClinic: 'Edmonton Animal Hospital',
      vetPhone: '780-555-0400',
    },
  });
  const existingPet2 = await prisma.pet.findFirst({ where: { clientId: clientProfile.id, name: 'Luna' } });
  const pet2 = existingPet2 ?? await prisma.pet.create({
    data: {
      clientId: clientProfile.id,
      name: 'Luna',
      species: 'Cat',
      breed: 'Tabby',
      weightKg: 4.5,
      dob: new Date('2021-03-01'),
      vaccinationStatus: 'current',
      feedingInstructions: 'Half a can of wet food morning, dry food available all day.',
      behavioralNotes: 'Shy at first but warms up quickly. Strictly indoor cat.',
    },
  });
  console.log('✓ Pets created: Biscuit, Luna');

  // ── Service packages ──────────────────────────────────────────────
  const packages = [
    {
      name: 'Drop-In Visit',
      slug: 'drop-in-visit',
      tagline: 'A quick check-in for your pet',
      description: 'Perfect for pets who just need feeding, playtime, and a potty break while you\'re away for the day.',
      basePrice: 28,
      priceUnit: 'per_visit' as const,
      durationMinutes: 30,
      category: 'drop_in' as const,
      isOvernight: false,
      constraintType: 'none' as const,
      allowsConcurrentBookings: false,
      travelTimeBudgetMinutes: 20,
      minBufferMinutes: 30,
      includedFeatures: ['Feeding & fresh water', 'Playtime & attention', 'Potty break', 'Visit report with photos'],
      petTypesAllowed: ['Dog', 'Cat', 'Small Animal'],
      maxPets: 3,
      displayOrder: 1,
    },
    {
      name: 'Dog Walking',
      slug: 'dog-walking',
      tagline: 'Structured exercise for your pup',
      description: 'A dedicated 45-minute walk in your neighbourhood. Great for high-energy dogs.',
      basePrice: 22,
      priceUnit: 'per_visit' as const,
      durationMinutes: 45,
      category: 'drop_in' as const,
      isOvernight: false,
      constraintType: 'none' as const,
      allowsConcurrentBookings: false,
      travelTimeBudgetMinutes: 15,
      minBufferMinutes: 30,
      includedFeatures: ['45-min neighbourhood walk', 'Post-walk report', 'GPS route tracking'],
      petTypesAllowed: ['Dog'],
      maxPets: 2,
      displayOrder: 2,
    },
    {
      name: 'House Sitting',
      slug: 'house-sitting',
      tagline: 'Someone home, always',
      description: 'Your sitter stays at your home overnight so your pets never feel alone. Ideal for anxious pets or multi-pet households.',
      basePrice: 85,
      priceUnit: 'per_night' as const,
      durationMinutes: 720,
      category: 'house_sit' as const,
      isOvernight: true,
      constraintType: 'absence_window' as const,
      maxAbsenceMinutes: 240,
      allowsConcurrentBookings: false,
      minBufferMinutes: 120,
      includedFeatures: ['Overnight stay', 'Unlimited visits & cuddles', 'Morning & evening feeding', 'Daily photo updates', 'Mail & plant care'],
      petTypesAllowed: ['Dog', 'Cat', 'Small Animal', 'Bird'],
      maxPets: 5,
      displayOrder: 3,
    },
    {
      name: 'Overnight Dog Boarding',
      slug: 'overnight-boarding',
      tagline: 'Home away from home',
      description: 'Your dog stays at your sitter\'s home for a cozy, personalized experience.',
      basePrice: 65,
      priceUnit: 'per_night' as const,
      durationMinutes: 720,
      category: 'overnight' as const,
      isOvernight: true,
      constraintType: 'none' as const,
      allowsConcurrentBookings: true,
      maxConcurrentClients: 2,
      minBufferMinutes: 60,
      includedFeatures: ['Overnight care', 'Feeding to your schedule', 'Morning walk included', 'Daily updates'],
      petTypesAllowed: ['Dog'],
      maxPets: 1,
      displayOrder: 4,
    },
  ];

  for (const pkg of packages) {
    await prisma.servicePackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }
  console.log('✓ Service packages created:', packages.map(p => p.name).join(', '));

  // ── Zones ──────────────────────────────────────────────────────────
  await prisma.zone.upsert({
    where: { id: 1 },
    update: { name: 'Edmonton Core' },
    create: {
      name: 'Edmonton Core',
      zoneType: 'primary',
      surchageModifier: 0,
      priorityLevel: 1,
      isActive: true,
    },
  });
  await prisma.zone.upsert({
    where: { id: 2 },
    update: { name: 'Sherwood Park' },
    create: {
      name: 'Sherwood Park',
      zoneType: 'secondary',
      surchageModifier: 0.15,
      priorityLevel: 2,
      isActive: true,
    },
  });
  console.log('✓ Zones created');

  // ── Notification email templates ──────────────────────────────────
  const templates = [
    {
      key: 'EMAIL_MAGIC_LINK',
      value: `Subject: Your Sit Happens login link\n\nHi there!\n\nClick the link below to log in to your Sit Happens account. This link expires in 15 minutes.\n\n{{loginUrl}}\n\nIf you didn't request this, you can ignore this email.\n\nWarm wags,\nThe Sit Happens Team`,
    },
    {
      key: 'EMAIL_NEW_BOOKING_ADMIN',
      value: `Subject: New booking request from {{clientName}}\n\nA new booking request has been submitted.\n\nClient: {{clientName}}\nService: {{packageName}}\nRequested Time: {{startTime}}\n\nPlease log in to the admin console to approve or decline this request.`,
    },
    {
      key: 'EMAIL_BOOKING_APPROVED',
      value: `Subject: Your booking is confirmed!\n\nHi {{clientName}},\n\nGreat news — your booking for {{startTime}} has been approved!\n\nYour sitter will arrive as scheduled. You'll receive updates throughout the visit.\n\nWarm wags,\nThe Sit Happens Team`,
    },
    {
      key: 'EMAIL_BOOKING_DECLINED',
      value: `Subject: Update on your booking request\n\nHi {{clientName}},\n\nUnfortunately we're unable to accommodate your recent booking request.\n\nReason: {{reason}}\n\nPlease visit our website to request a different time. We're sorry for the inconvenience.\n\nWarm wags,\nThe Sit Happens Team`,
    },
    {
      key: 'EMAIL_JOB_ASSIGNED',
      value: `Subject: New job assigned — {{startTime}}\n\nHi {{staffName}},\n\nYou've been assigned a new booking!\n\nDate/Time: {{startTime}}\nAddress: {{address}}\n\nPlease log in to the staff portal to view full details and client instructions.\n\nThanks,\nSit Happens`,
    },
    {
      key: 'EMAIL_INCIDENT_REPORT_ADMIN',
      value: `Subject: URGENT: Incident Report from {{staffName}}\n\nSeverity: {{severity}}\nStaff: {{staffName}}\n\nDescription:\n{{description}}\n\nPlease log in to review this report immediately.`,
    },
  ];

  for (const t of templates) {
    await prisma.siteSetting.upsert({
      where: { key: t.key },
      update: { value: t.value },
      create: { key: t.key, value: t.value },
    });
  }
  console.log('✓ Email templates seeded');

  // ── Staff availability (next 14 days) ─────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    await prisma.sitterAvailability.upsert({
      where: { staffId_date: { staffId: staffProfile.id, date } },
      update: {},
      create: {
        staffId: staffProfile.id,
        date,
        isAvailable: !isWeekend, // available weekdays
        source: 'manual',
      },
    });
  }
  console.log('✓ Staff availability seeded (14 days)');

  console.log('\n✅ Seed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin:  admin@sithappens.ca / admin123');
  console.log('  Staff:  sarah@sithappens.ca / staff123');
  console.log('  Client: emma@example.com / client123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
