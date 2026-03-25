'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AddressStepProps {
  address: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  onNext: () => void;
}

interface GeoResult {
  valid: boolean;
  lat?: number;
  lng?: number;
  message: string;
  color: 'green' | 'amber' | 'red';
}

// Edmonton service area bounding box (approx)
const EDMONTON_BOUNDS = { minLat: 53.35, maxLat: 53.75, minLng: -113.75, maxLng: -113.2 };

function isInServiceArea(lat: number, lng: number): boolean {
  return lat >= EDMONTON_BOUNDS.minLat && lat <= EDMONTON_BOUNDS.maxLat
    && lng >= EDMONTON_BOUNDS.minLng && lng <= EDMONTON_BOUNDS.maxLng;
}

export function AddressStep({ address, onChange, onNext }: AddressStepProps) {
  const [checking, setChecking] = useState(false);
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [accessInstructions, setAccessInstructions] = useState('');

  const checkAddress = async (addr: string) => {
    if (addr.trim().length < 8) { setGeoResult(null); return; }
    setChecking(true);
    try {
      // Use Nominatim (free, no key required) for geocoding in dev
      const encoded = encodeURIComponent(`${addr}, Edmonton, Alberta, Canada`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        const inArea = isInServiceArea(latNum, lngNum);
        setGeoResult({
          valid: inArea,
          lat: latNum,
          lng: lngNum,
          message: inArea
            ? '✓ This address is within our service area.'
            : '⚠ This address may be outside our primary service area. We may still be able to help — continue to check availability.',
          color: inArea ? 'green' : 'amber',
        });
        if (inArea) onChange(addr, latNum, lngNum);
        else onChange(addr);
      } else {
        setGeoResult({ valid: false, message: 'Address not found. Please check the spelling or try a nearby intersection.', color: 'red' });
        onChange(addr);
      }
    } catch {
      // Geocoding failed silently — let user continue anyway
      setGeoResult(null);
      onChange(addr);
    } finally {
      setChecking(false);
    }
  };

  const handleAddressChange = (val: string) => {
    onChange(val);
    setGeoResult(null);
  };

  const handleBlur = () => { if (address.trim().length >= 8) checkAddress(address); };

  const canProceed = address.trim().length >= 8;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-1">Where will the service take place?</h2>
        <p className="text-warm-600 text-sm">Enter your address to check availability in your area.</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-warm-800 mb-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-warm-500" />
            Service Address
          </span>
          <div className="relative">
            <input
              type="text"
              className="w-full h-12 px-4 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all text-sm"
              placeholder="123 Main St, Edmonton, AB"
              value={address}
              onChange={e => handleAddressChange(e.target.value)}
              onBlur={handleBlur}
            />
            {checking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-warm-400 animate-spin" />
              </div>
            )}
          </div>
        </label>

        {geoResult && (
          <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm ${
            geoResult.color === 'green' ? 'bg-sage-50 text-sage-800 border border-sage-100'
            : geoResult.color === 'amber' ? 'bg-amber-50 text-amber-800 border border-amber-100'
            : 'bg-red-50 text-red-800 border border-red-100'
          }`}>
            {geoResult.color === 'green'
              ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <p>{geoResult.message}</p>
          </div>
        )}

        <label className="block pt-2">
          <span className="text-sm font-semibold text-warm-800 mb-1.5 block">Home Access Instructions <span className="text-warm-400 font-normal">(optional)</span></span>
          <textarea
            className="w-full h-24 p-3.5 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-400 transition-all resize-none text-sm"
            placeholder="e.g. Key code is 1234, please lock the bottom lock when leaving."
            value={accessInstructions}
            onChange={e => setAccessInstructions(e.target.value)}
          />
        </label>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!canProceed}
          className="px-8"
        >
          Continue to Service Selection
        </Button>
      </div>
    </div>
  );
}
