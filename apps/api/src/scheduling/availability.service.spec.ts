import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';
import { MapboxService } from './mapbox.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prisma: PrismaService;
  let mapbox: MapboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: PrismaService,
          useValue: {
            servicePackage: { findUnique: jest.fn() },
            booking: { findMany: jest.fn() },
            staff: { findMany: jest.fn() }
          }
        },
        {
          provide: MapboxService,
          useValue: {
            getRouteTime: jest.fn(),
            getMultiStopRouteTime: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    prisma = module.get<PrismaService>(PrismaService);
    mapbox = module.get<MapboxService>(MapboxService);
  });

  const mockClientLoc = { locationLat: 53.05, locationLng: -113.05 };

  it('should return slots when staff has no existing bookings', async () => {
    (prisma.servicePackage.findUnique as jest.Mock).mockResolvedValue({
      id: 1, durationMinutes: 60, allowsConcurrentBookings: false
    });
    (prisma.booking.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.staff.findMany as jest.Mock).mockResolvedValue([{
      id: 10, isActive: true, sitterAvailability: [{ isAvailable: true }]
    }]);

    const result = await service.getAvailableSlots({
      date: '2026-10-01', packageId: 1, lat: 53.0, lng: -113.0
    });

    expect(result.length).toBeGreaterThan(0);
  });

  it('should reject slots that overlap with existing non-concurrent bookings', async () => {
    (prisma.servicePackage.findUnique as jest.Mock).mockResolvedValue({
      id: 1, durationMinutes: 60, allowsConcurrentBookings: false
    });
    // Existing booking from 10:00 to 11:00
    (prisma.booking.findMany as jest.Mock).mockResolvedValue([{
      id: 99, staffId: 10, 
      startTime: new Date('2026-10-01T10:00:00Z'), 
      endTime: new Date('2026-10-01T11:00:00Z'),
      client: mockClientLoc
    }]);
    (prisma.staff.findMany as jest.Mock).mockResolvedValue([{
      id: 10, isActive: true, sitterAvailability: [{ isAvailable: true }]
    }]);

    const result = await service.getAvailableSlots({
      date: '2026-10-01', packageId: 1, lat: 53.0, lng: -113.0
    });

    const overlapSlot = result.find(s => s.start === '2026-10-01T10:00:00.000Z');
    expect(overlapSlot).toBeUndefined();
  });

  it('should allow concurrent slots if TSP route is feasible', async () => {
    (prisma.servicePackage.findUnique as jest.Mock).mockResolvedValue({
      id: 2, durationMinutes: 120, allowsConcurrentBookings: true, maxConcurrentClients: 3, maxAbsenceMinutes: 60
    });
    (prisma.booking.findMany as jest.Mock).mockResolvedValue([{
      id: 100, staffId: 10, 
      startTime: new Date('2026-10-01T10:00:00Z'), 
      endTime: new Date('2026-10-01T12:00:00Z'),
      client: { locationLat: 53.1, locationLng: -113.1 }
    }]);
    (prisma.staff.findMany as jest.Mock).mockResolvedValue([{
      id: 10, isActive: true, baseLocationLat: 53.0, baseLocationLng: -113.0,
      sitterAvailability: [{ isAvailable: true }]
    }]);
    
    (mapbox.getMultiStopRouteTime as jest.Mock).mockResolvedValue(1200); // 20 mins

    const result = await service.getAvailableSlots({
      date: '2026-10-01', packageId: 2, lat: 53.2, lng: -113.2
    });

    console.log('Slots:', result.map(s => s.start));

    // Check if slot starting at 10:00 exists
    const concurrentSlot = result.find(s => s.start === '2026-10-01T10:00:00.000Z');
    expect(concurrentSlot).toBeDefined();
  });

  it('should reject concurrent slots if TSP route exceeds maxAbsenceMinutes', async () => {
    (prisma.servicePackage.findUnique as jest.Mock).mockResolvedValue({
      id: 2, durationMinutes: 120, allowsConcurrentBookings: true, maxConcurrentClients: 3, maxAbsenceMinutes: 30
    });
    (prisma.booking.findMany as jest.Mock).mockResolvedValue([{
      id: 101, staffId: 10, 
      startTime: new Date('2026-10-01T10:00:00Z'), 
      endTime: new Date('2026-10-01T12:00:00Z'),
      client: { locationLat: 53.1, locationLng: -113.1 }
    }]);
    (prisma.staff.findMany as jest.Mock).mockResolvedValue([{
      id: 10, isActive: true, baseLocationLat: 53.0, baseLocationLng: -113.0,
      sitterAvailability: [{ isAvailable: true }]
    }]);
    
    (mapbox.getMultiStopRouteTime as jest.Mock).mockResolvedValue(2700); // 45 mins

    const result = await service.getAvailableSlots({
      date: '2026-10-01', packageId: 2, lat: 53.2, lng: -113.2
    });

    const concurrentSlot = result.find(s => s.start === '2026-10-01T10:00:00.000Z');
    expect(concurrentSlot).toBeUndefined();
  });
});
