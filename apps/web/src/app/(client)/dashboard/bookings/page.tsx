'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Calendar, Clock, AlertTriangle, CheckCircle, Loader2, X, ArrowLeft } from 'lucide-react';

interface Booking {
  id: number;
  status: string;
  startTime: string;
  endTime: string;
  totalCharged: number;
  clientNotes: string | null;
  package: { name: string; durationMinutes: number };
  staff: { user: { name: string } } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
  approved:  { label: 'Confirmed',        color: 'bg-sage-50 text-sage-700 border-sage-200',     icon: CheckCircle },
  active:    { label: 'In Progress',      color: 'bg-blue-50 text-blue-700 border-blue-200',     icon: Clock },
  completed: { label: 'Completed',        color: 'bg-neutral-50 text-neutral-600 border-neutral-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled',        color: 'bg-red-50 text-red-600 border-red-200',        icon: X },
  declined:  { label: 'Declined',         color: 'bg-red-50 text-red-600 border-red-200',        icon: X },
};

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    api.bookings.getAll()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking? A refund will be processed if payment was captured.')) return;
    try {
      await api.bookings.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const now = new Date();
  const filtered = bookings.filter(b => {
    const start = new Date(b.startTime);
    if (filter === 'upcoming') return ['pending', 'approved', 'active'].includes(b.status);
    if (filter === 'past') return ['completed', 'cancelled', 'declined'].includes(b.status) || start < now;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">My Bookings</h1>
          <p className="text-neutral-500 text-sm">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-neutral-100 rounded-xl p-1 w-fit">
        {(['upcoming', 'past', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
              filter === tab ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <Calendar className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="font-semibold text-neutral-600">No {filter} bookings</p>
          {filter === 'upcoming' && (
            <Link href="/book" className="mt-4 inline-block text-sm text-sage-600 font-semibold hover:text-sage-700">
              Book a service →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const canCancel = ['pending', 'approved'].includes(b.status);
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors">
                <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-neutral-900">{b.package.name}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-500 space-y-0.5">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(b.startTime).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {b.staff && <span className="text-neutral-400">· Sitter: {b.staff.user.name}</span>}
                      </p>
                    </div>
                    {b.status === 'pending' && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Awaiting sitter assignment — you won't be charged until approved.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="font-bold text-neutral-900">${Number(b.totalCharged).toFixed(2)}</p>
                    <p className="text-xs text-neutral-400">BK-{b.id}</p>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
