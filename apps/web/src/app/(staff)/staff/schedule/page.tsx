'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: number;
  status: string;
  startTime: string;
  endTime: string;
  client: { address: string | null; user: { name: string } };
  package: { name: string };
}

const STATUS_COLOR: Record<string, string> = {
  approved:  'bg-sage-100 text-sage-800 border-sage-200',
  active:    'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

export default function StaffSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all upcoming + recent jobs from dashboard
    fetchWithAuth('/staff-operations/dashboard')
      .then((data: any) => setJobs(data.todayJobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const jobsForDay = (day: Date) =>
    jobs.filter(j => isSameDay(new Date(j.startTime), day));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Schedule</h1>
          <p className="text-neutral-500 text-sm mt-1">Your weekly job calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(d => addDays(d, -7))}
            className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-600" />
          </button>
          <span className="text-sm font-semibold text-neutral-700 min-w-[140px] text-center">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setWeekStart(d => addDays(d, 7))}
            className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-neutral-100">
            {weekDays.map(day => {
              const isToday = isSameDay(day, today);
              return (
                <div key={day.toISOString()} className={`py-3 text-center border-r border-neutral-50 last:border-0 ${isToday ? 'bg-sage-50' : ''}`}>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{format(day, 'EEE')}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-sage-700' : 'text-neutral-700'}`}>{format(day, 'd')}</p>
                </div>
              );
            })}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDays.map(day => {
              const dayJobs = jobsForDay(day);
              const isToday = isSameDay(day, today);
              return (
                <div key={day.toISOString()} className={`p-2 border-r border-neutral-50 last:border-0 min-h-[200px] ${isToday ? 'bg-sage-50/30' : ''}`}>
                  <div className="space-y-1.5">
                    {dayJobs.map(job => (
                      <Link
                        key={job.id}
                        href={`/staff/jobs/${job.id}`}
                        className={`block rounded-xl border p-2 text-xs hover:shadow-sm transition-all ${STATUS_COLOR[job.status] || 'bg-neutral-50 border-neutral-200'}`}
                      >
                        <p className="font-bold truncate leading-snug">{job.package.name}</p>
                        <p className="flex items-center gap-1 mt-0.5 opacity-75">
                          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                          {format(new Date(job.startTime), 'h:mm a')}
                        </p>
                        {job.client.address && (
                          <p className="flex items-center gap-1 mt-0.5 opacity-75 truncate">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{job.client.address.split(',')[0]}</span>
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <p className="text-center text-neutral-400 text-sm py-4">
          No jobs found for this period. Check your dashboard for the latest updates.
        </p>
      )}
    </div>
  );
}
