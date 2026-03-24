import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MapboxService } from './mapbox.service';

@Injectable()
export class AvailabilityService {
  constructor(
    private prisma: PrismaService,
    private mapboxService: MapboxService
  ) {}

  async getAvailableSlots({ date, packageId, lat, lng, durationMinutes }: { date: string, packageId: number, lat: number, lng: number, durationMinutes?: number }) {
    const pkg = await this.prisma.servicePackage.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error('Package not found');

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 1. Fetch active bookings and staff
    const [existingBookings, activeStaff] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ['approved', 'active'] }
        },
        include: { client: true, package: true }
      }),
      this.prisma.staff.findMany({ 
        where: { isActive: true },
        include: { sitterAvailability: { where: { date: startOfDay, isAvailable: true } } }
      })
    ]);

    const availableSlots: Array<{ start: string; end: string; staffId: number }> = [];

    // 2. Evaluate 30-min window slots (9 AM to 6 PM standard)
    const baseHour = 9;
    const totalSlots = 18; // 9 hours * 2 slots/hr

    for (let i = 0; i < totalSlots; i++) {
        const duration = durationMinutes || pkg.durationMinutes;
        const slotStart = new Date(startOfDay);
        slotStart.setUTCHours(baseHour, i * 30, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        for (const staff of activeStaff) {
            // Check if staff is manually available
            if (staff.sitterAvailability.length === 0) continue;

            // Find concurrent or adjacent bookings for this staff
            const staffBookings = existingBookings.filter(b => b.staffId === staff.id);
            
            // Basic conflict check: slot overlap
            const hasOverlap = staffBookings.some(b => 
                (slotStart < b.endTime && slotEnd > b.startTime)
            );
            
            if (hasOverlap && !pkg.allowsConcurrentBookings) continue;

            // TSP optimization & Constraint Check
            const isFeasible = await this.checkFeasibility(staff, staffBookings, slotStart, slotEnd, { lat, lng }, pkg);
            
            if (isFeasible) {
                availableSlots.push({
                    start: slotStart.toISOString(),
                    end: slotEnd.toISOString(),
                    staffId: staff.id
                });
            }
        }
    }

    return this.deduplicateSlots(availableSlots);
  }

  private async checkFeasibility(staff: any, existing: any[], newStart: Date, newEnd: Date, newLoc: { lat: number, lng: number }, pkg: any) {
    // 1. If not concurrent, check travel buffer
    if (!pkg.allowsConcurrentBookings) {
        // Find nearest booking before and after
        const before = [...existing].filter(b => b.endTime <= newStart).sort((a,b) => b.endTime.getTime() - a.endTime.getTime())[0];
        const after = [...existing].filter(b => b.startTime >= newEnd).sort((a,b) => a.startTime.getTime() - b.startTime.getTime())[0];

        if (before) {
            const travelTime = await this.mapboxService.getRouteTime(
                { lat: before.client.locationLat!, lng: before.client.locationLng! },
                newLoc
            );
            if (newStart.getTime() - before.endTime.getTime() < travelTime * 1000) return false;
        }

        if (after) {
            const travelTime = await this.mapboxService.getRouteTime(
                newLoc,
                { lat: after.client.locationLat!, lng: after.client.locationLng! }
            );
            if (after.startTime.getTime() - newEnd.getTime() < travelTime * 1000) return false;
        }
        return true;
    }

    // 2. If concurrent (TSP check)
    // Find anchor and its concurrent mates
    const concurrentGroup = existing.filter(b => 
        (b.startTime <= newStart && b.endTime >= newEnd) || 
        (newStart <= b.startTime && newEnd >= b.endTime)
    );

    if (concurrentGroup.length >= (pkg.maxConcurrentClients || 3)) return false;

    // Evaluate total travel for the sequence: Sitter -> Client A -> Client B -> Client C -> Wait for End
    // For MVP TSP, we evaluate the duration of the entire concurrent "house sit" session.
    // If the visits plus travel exceed maxAbsenceMinutes, it's infeasible.
    
    // We'll simplify for the "3+ concurrent" task:
    // Every waypoint must be visited. The sitter must return to the primary (anchor) by the end of the window.
    // Logic: Sum of visit durations (skipped if truly concurrent/multi-tasking) + Sum of travel times between them
    // MUST be <= pkg.maxAbsenceMinutes.
    
    const waypoints = [
        { lat: staff.baseLocationLat || 53.5461, lng: staff.baseLocationLng || -113.4938 }, // Start at base or previous
        ...concurrentGroup.map(b => ({ lat: b.client.locationLat!, lng: b.client.locationLng! })),
        newLoc
    ];

    const totalTravelTime = await this.mapboxService.getMultiStopRouteTime(waypoints);
    
    // Constraint: Max absence from any single pet
    // This is complex, but the heuristic is: Total Time Out <= maxAbsenceMinutes
    if (totalTravelTime / 60 > (pkg.maxAbsenceMinutes || 120)) return false;

    return true;
  }

  private deduplicateSlots(slots: any[]) {
      // Group by start time, keep one
      const map = new Map();
      slots.forEach(s => map.set(s.start, s));
      return Array.from(map.values()).sort((a,b) => a.start.localeCompare(b.start));
  }
}
