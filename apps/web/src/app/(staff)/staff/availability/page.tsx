'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { addDays, format, isSameDay } from 'date-fns';
import { Check, X, Loader2, CalendarCheck } from 'lucide-react';

interface DayStatus {
  date: Date;
  isAvailable: boolean | null; // null = not set yet
  saving: boolean;
}

export default function AvailabilityPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [days, setDays] = useState<DayStatus[]>(
    Array.from({ length: 28 }, (_, i) => ({
      date: addDays(today, i + 1),
      isAvailable: null,
      saving: false,
    }))
  );
  const [note, setNote] = useState('');

  const toggle = async (date: Date) => {
    const idx = days.findIndex(d => isSameDay(d.date, date));
    if (idx === -1) return;
    const current = days[idx].isAvailable;
    const next = current === true ? false : true;

    setDays(prev => prev.map((d, i) => i === idx ? { ...d, saving: true } : d));
    try {
      await api.staff.setAvailability({
        date: format(date, 'yyyy-MM-dd'),
        isAvailable: next,
        notes: note || undefined,
      });
      setDays(prev => prev.map((d, i) => i === idx ? { ...d, isAvailable: next, saving: false } : d));
    } catch (e: any) {
      alert(e.message);
      setDays(prev => prev.map((d, i) => i === idx ? { ...d, saving: false } : d));
    }
  };

  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => days.slice(i * 7, i * 7 + 7));
  const availableCount = days.filter(d => d.isAvailable === true).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">My Availability</h1>
        <p className="text-neutral-500 text-sm mt-1">Tap a day to mark yourself available or unavailable for the next 28 days</p>
      </div>

      <div className="bg-sage-50 border border-sage-100 rounded-2xl p-4 flex items-center gap-4">
        <CalendarCheck className="w-5 h-5 text-sage-600 flex-shrink-0" />
        <p className="text-sm text-sage-800">
          You are marked available on <strong>{availableCount}</strong> day{availableCount !== 1 ? 's' : ''} in the next 28 days.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Default note for availability changes</label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Available after 9am only"
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-neutral-50 last:border-0">
              {week.map((day, di) => {
                const dayOfWeek = (day.date.getDay() + 6) % 7; // Mon=0
                return (
                  <div
                    key={di}
                    style={{ gridColumnStart: di === 0 ? dayOfWeek + 1 : undefined }}
                    className="p-1"
                  >
                    <button
                      onClick={() => toggle(day.date)}
                      disabled={day.saving}
                      className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-center ${
                        day.isAvailable === true
                          ? 'bg-sage-600 text-white shadow-sm hover:bg-sage-700'
                          : day.isAvailable === false
                          ? 'bg-red-50 text-red-400 border border-red-100 hover:bg-red-100'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-100 hover:bg-neutral-100'
                      }`}
                    >
                      {day.saving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <span className="text-xs font-bold leading-none">{format(day.date, 'd')}</span>
                          <span className="text-[8px] font-medium opacity-70">{format(day.date, 'MMM')}</span>
                          {day.isAvailable === true && <Check className="w-2.5 h-2.5 mt-0.5" />}
                          {day.isAvailable === false && <X className="w-2.5 h-2.5 mt-0.5" />}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-neutral-500">
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-sage-600 rounded flex-shrink-0" />Available</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-red-50 border border-red-100 rounded flex-shrink-0" />Unavailable</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-neutral-50 border border-neutral-100 rounded flex-shrink-0" />Not set</span>
      </div>
    </div>
  );
}
