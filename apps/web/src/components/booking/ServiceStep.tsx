'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface ServicePackage {
  id: number;
  name: string;
  tagline: string | null;
  basePrice: number;
  priceUnit: string;
  durationMinutes: number;
  category: string;
  includedFeatures: string[];
}

interface ServiceStepProps {
  selectedServiceId: number | null;
  onChange: (serviceId: number, pkg: ServicePackage) => void;
  onNext: () => void;
  onBack: () => void;
}

const priceUnitLabel: Record<string, string> = {
  per_visit: '/ visit',
  per_night: '/ night',
  per_hour: '/ hr',
  flat: 'flat',
};

export function ServiceStep({ selectedServiceId, onChange, onNext, onBack }: ServiceStepProps) {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.packages.getAll()
      .then(setPackages)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="py-10 text-center text-red-600">
      <p className="font-semibold">Failed to load services</p>
      <p className="text-sm mt-1">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-1">Select a Service</h2>
        <p className="text-warm-600 text-sm">Choose the type of care your pet needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const isSelected = selectedServiceId === pkg.id;
          return (
            <button
              key={pkg.id}
              onClick={() => onChange(pkg.id, pkg)}
              className={`text-left p-5 rounded-2xl border-2 transition-all relative ${
                isSelected
                  ? 'border-sage-600 bg-sage-50 shadow-md ring-2 ring-sage-600/10'
                  : 'border-warm-200 hover:border-sage-300 hover:bg-warm-50 bg-white'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-sage-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <h3 className={`text-base font-bold mb-1 ${isSelected ? 'text-sage-900' : 'text-warm-900'}`}>{pkg.name}</h3>
              {pkg.tagline && <p className="text-xs text-warm-500 mb-3">{pkg.tagline}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100">
                <span className="text-xs text-warm-500">{pkg.durationMinutes >= 60 ? `${pkg.durationMinutes / 60}h` : `${pkg.durationMinutes}min`}</span>
                <span className={`font-bold text-base ${isSelected ? 'text-sage-700' : 'text-warm-800'}`}>
                  ${Number(pkg.basePrice).toFixed(0)}<span className="text-xs font-medium ml-1">{priceUnitLabel[pkg.priceUnit] || ''}</span>
                </span>
              </div>
              {pkg.includedFeatures?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {pkg.includedFeatures.slice(0, 3).map((f) => (
                    <li key={f} className="text-xs text-warm-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-sage-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 flex justify-between border-t border-warm-100">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="primary" onClick={onNext} disabled={!selectedServiceId}>
          Continue to Schedule
        </Button>
      </div>
    </div>
  );
}
