import { Test, TestingModule } from '@nestjs/testing';
import { MonitorService } from './monitor.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppGateway } from '../../gateway/app.gateway';

describe('MonitorService', () => {
  let service: MonitorService;
  let prisma: PrismaService;
  let gateway: AppGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorService,
        {
          provide: PrismaService,
          useValue: {
            booking: { findMany: jest.fn() }
          }
        },
        {
          provide: AppGateway,
          useValue: {
            notifyAdmin: jest.fn(),
            notifyStaff: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<MonitorService>(MonitorService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<AppGateway>(AppGateway);
  });

  it('should emit a warning when 80% threshold is reached', async () => {
    const now = new Date();
    // 60 min limit, 50 mins elapsed (83% > 80%)
    const lastCheckInTime = new Date(now.getTime() - 50 * 60000);
    
    const mockActiveBooking = {
      id: 500,
      status: 'active',
      staffId: 99,
      package: { maxAbsenceMinutes: 60 },
      client: { user: { name: 'Test Client' } },
      staff: { user: { name: 'Test Sitter' } },
      visitCheckIns: [{ timestamp: lastCheckInTime }]
    };

    (prisma.booking.findMany as jest.Mock).mockResolvedValue([mockActiveBooking]);

    await service.checkActiveBookings();

    expect(gateway.notifyAdmin).toHaveBeenCalledWith('constraint:warning', expect.any(Object));
    expect(gateway.notifyStaff).toHaveBeenCalledWith(99, 'constraint:warning', expect.any(Object));
  });

  it('should emit a breach when 100% threshold is reached', async () => {
    const now = new Date();
    // 60 min limit, 65 mins elapsed (108% > 100%)
    const lastCheckInTime = new Date(now.getTime() - 65 * 60000);
    
    const mockActiveBooking = {
      id: 501,
      status: 'active',
      staffId: 99,
      package: { maxAbsenceMinutes: 60 },
      client: { user: { name: 'Test Client' } },
      staff: { user: { name: 'Test Sitter' } },
      visitCheckIns: [{ timestamp: lastCheckInTime }]
    };

    (prisma.booking.findMany as jest.Mock).mockResolvedValue([mockActiveBooking]);

    await service.checkActiveBookings();

    expect(gateway.notifyAdmin).toHaveBeenCalledWith('constraint:breach', expect.any(Object));
    expect(gateway.notifyStaff).toHaveBeenCalledWith(99, 'constraint:breach', expect.any(Object));
  });
});
