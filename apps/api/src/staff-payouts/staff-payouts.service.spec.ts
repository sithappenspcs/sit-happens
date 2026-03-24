import { Test, TestingModule } from '@nestjs/testing';
import { StaffPayoutsService } from './staff-payouts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StaffPayoutsService', () => {
  let service: StaffPayoutsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffPayoutsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn((callback) => callback({
              staffPayout: { create: jest.fn().mockResolvedValue({ id: 1 }) },
              booking: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) }
            })),
            booking: {
              findMany: jest.fn(),
            },
          }
        }
      ],
    }).compile();

    service = module.get<StaffPayoutsService>(StaffPayoutsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePayouts', () => {
    it('should aggregate booking payouts for a staff member', async () => {
      const mockBookings = [
        { id: 1, staffId: 10, staffPayout: 50.0 },
        { id: 2, staffId: 10, staffPayout: 75.0 },
      ];

      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await service.generatePayouts('2026-10-01', '2026-10-15');

      expect(prisma.booking.findMany).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.payouts).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
      expect(result.count).toBe(1);
    });
  });
});
