import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class MapboxService {
  constructor(private prisma: PrismaService) {}

  async getRouteTime(origin: { lat: number; lng: number }, dest: { lat: number; lng: number }): Promise<number> {
    return this.getMultiStopRouteTime([origin, dest]);
  }

  async getMultiStopRouteTime(waypoints: Array<{ lat: number; lng: number }>): Promise<number> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    // 1. Generate waypoints string and hash for caching
    const waypointsStr = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const hash = createHash('sha256').update(waypointsStr).digest('hex');

    // 2. Check Cache
    const cached = await this.prisma.routeCache.findUnique({ where: { waypointsHash: hash } });
    if (cached && cached.expiresAt > new Date()) {
      return cached.durationSeconds;
    }

    if (!token) return 600 + (waypoints.length - 2) * 300; // fallback

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsStr}?access_token=${token}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const duration = data.routes[0].duration;
        const distance = data.routes[0].distance;

        // 3. Save to Cache
        await this.prisma.routeCache.create({
          data: {
            originLat: waypoints[0].lat,
            originLng: waypoints[0].lng,
            destinationLat: waypoints[waypoints.length - 1].lat,
            destinationLng: waypoints[waypoints.length - 1].lng,
            waypointsHash: hash,
            waypointsJson: waypoints as any,
            durationSeconds: Math.ceil(duration),
            distanceMeters: Math.ceil(distance),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
          }
        }).catch(() => {}); // ignore race condition unique constraint

        return duration;
      }
    } catch (e) {
      console.error('Mapbox API error:', e);
    }
    return 600;
  }
}
