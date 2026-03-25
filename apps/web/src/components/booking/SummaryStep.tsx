'use client';

import { Button } from '@/components/ui/Button';
import { Loader2, MapPin, Calendar, PawPrint, Package } from 'lucide-react';

interface SummaryStepProps {
  bookingData: any;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

export function SummaryStep({ bookingData, onBack, onSubmit, submitting, error }: SummaryStepProps) {
  const pkg = bookingData.selectedPackage;
  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const formatTime = (t: string | null) =>
    t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-1">Review & Confirm</h2>
        <p className="text-warm-600 text-sm">Please review your booking details before submitting.</p>
      </div>

      <div className="bg-warm-50 border border-warm-200 rounded-2xl divide-y divide-warm-100 overflow-hidden">
        {pkg && (
          <div className="flex items-start gap-4 p-4">
            <Package className="w-4 h-4 text-warm-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-0.5">Service</p>
              <p className="text-sm font-semibold text-warm-900">{pkg.name}</p>
              <p className="text-sm text-warm-600">${Number(pkg.basePrice).toFixed(2)} {pkg.priceUnit?.replace('_', ' ')}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 p-4">
          <MapPin className="w-4 h-4 text-warm-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-0.5">Location</p>
            <p className="text-sm text-warm-900">{bookingData.address || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4">
          <Calendar className="w-4 h-4 text-warm-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-0.5">Date & Time</p>
            <p className="text-sm font-semibold text-warm-900">{formatDate(bookingData.date)}</p>
            <p className="text-sm text-warm-600">Starts at {formatTime(bookingData.startTime)}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4">
          <PawPrint className="w-4 h-4 text-warm-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-0.5">Pets</p>
            <p className="text-sm text-warm-900">{bookingData.petIds.length} pet{bookingData.petIds.length !== 1 ? 's' : ''} selected</p>
          </div>
        </div>
      </div>

      <div className="bg-sage-50 border border-sage-100 rounded-2xl p-4">
        <p className="text-xs text-sage-700 font-medium">
          By confirming, you authorize a hold to be placed on your payment method. You won't be charged until a sitter is assigned and the booking is approved.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={submitting}>Back</Button>
        <Button variant="primary" onClick={onSubmit} disabled={submitting} className="px-8">
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
          ) : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );
}
