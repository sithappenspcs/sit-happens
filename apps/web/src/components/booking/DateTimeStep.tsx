'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { format, addDays, isSameDay } from 'date-fns';
import { CalendarIcon, ClockIcon, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Slot {
  start: string;
  end: string;
  staffId: number;
}

interface DateTimeStepProps {
  date: Date | null;
  startTime: string | null;
  packageId: number | null;
  lat: number;
  lng: number;
  onChange: (date: Date, start: string, end: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DateTimeStep({ date, startTime, packageId, lat, lng, onChange, onNext, onBack }: DateTimeStepProps) {
  const upcomingDays = Array.from({ length: 10 }).map((_, i) => addDays(new Date(), i + 1));

  const [tempDate, setTempDate] = useState<Date | null>(date);
  const [tempSlot, setTempSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  useEffect(() => {
    if (!tempDate || !packageId) return;
    setLoadingSlots(true);
    setSlotsError(null);
    setSlots([]);
    setTempSlot(null);

    api.scheduling.getSlots({
      date: format(tempDate, 'yyyy-MM-dd'),
      packageId,
      lat,
      lng,
    })
      .then(setSlots)
      .catch((e) => setSlotsError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [tempDate, packageId, lat, lng]);

  const handleNext = () => {
    if (tempDate && tempSlot) {
      onChange(tempDate, tempSlot.start, tempSlot.end);
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-1">When do you need us?</h2>
        <p className="text-warm-600 text-sm">Select a date to see real-time availability.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Date */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Select Date
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {upcomingDays.map((d, i) => {
              const isSelected = tempDate ? isSameDay(tempDate, d) : false;
              return (
                <button
                  key={i}
                  onClick={() => setTempDate(d)}
                  className={`p-3 rounded-xl border flex flex-col items-center transition-all ${
                    isSelected
                      ? 'bg-sage-600 border-sage-600 text-white shadow-md'
                      : 'bg-white border-warm-200 text-warm-700 hover:border-sage-300 hover:bg-sage-50'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{format(d, 'EEE')}</span>
                  <span className="text-xl font-bold mt-0.5">{format(d, 'd')}</span>
                  <span className="text-[10px] opacity-70">{format(d, 'MMM')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider flex items-center gap-2">
            <ClockIcon className="w-4 h-4" /> Available Times
          </h3>

          {!tempDate ? (
            <div className="flex items-center justify-center h-32 bg-warm-50 border border-warm-100 border-dashed rounded-xl text-warm-400 text-sm text-center p-4">
              Select a date to see available times
            </div>
          ) : loadingSlots ? (
            <div className="flex items-center justify-center h-32 gap-2 text-warm-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Checking availability...</span>
            </div>
          ) : slotsError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{slotsError}</div>
          ) : slots.length === 0 ? (
            <div className="flex items-center justify-center h-32 bg-warm-50 border border-warm-100 border-dashed rounded-xl text-warm-400 text-sm text-center p-4">
              No availability on this date. Try another day.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {slots.map((slot) => {
                const isSelected = tempSlot?.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    onClick={() => setTempSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-sage-100 border-sage-600 text-sage-800 ring-1 ring-sage-600'
                        : 'bg-white border-warm-200 text-warm-700 hover:border-sage-400'
                    }`}
                  >
                    {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex justify-between border-t border-warm-100">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="primary" onClick={handleNext} disabled={!tempDate || !tempSlot}>
          Continue to Pets
        </Button>
      </div>
    </div>
  );
}
