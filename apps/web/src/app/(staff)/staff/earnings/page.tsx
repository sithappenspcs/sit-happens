'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { DollarSign, TrendingUp, Loader2 } from 'lucide-react';

interface Payout {
  id: number;
  status: string;
  totalEarned: number;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
}

export default function EarningsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/staff-operations/payouts')
      .then(setPayouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending = payouts.filter(p => p.status === 'pending');
  const pendingTotal = pending.reduce((s, p) => s + Number(p.totalEarned), 0);
  const lifetimeTotal = payouts.reduce((s, p) => s + Number(p.totalEarned), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Earnings</h1>
        <p className="text-neutral-500 text-sm mt-1">Your payout history and upcoming payments</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-sage-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-24 h-24" /></div>
          <p className="text-sage-100 text-xs font-semibold uppercase tracking-wider mb-3">Pending Payout</p>
          <p className="text-3xl font-bold">${pendingTotal.toFixed(2)}</p>
          <p className="text-sage-200 text-xs mt-1">Transferred on 1st & 16th</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-sage-600" />
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Lifetime Earned</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900">${lifetimeTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">Payout History</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="p-10 text-center text-neutral-400">
            <DollarSign className="w-10 h-10 mx-auto mb-2 text-neutral-200" />
            <p className="text-sm font-medium">No payouts yet. Complete bookings to start earning.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {payouts.map(p => (
              <li key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    {new Date(p.periodStart).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} –{' '}
                    {new Date(p.periodEnd).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {p.paidAt && (
                    <p className="text-xs text-neutral-400">Paid {new Date(p.paidAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-neutral-900">${Number(p.totalEarned).toFixed(2)}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    p.status === 'paid' ? 'bg-sage-50 text-sage-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
