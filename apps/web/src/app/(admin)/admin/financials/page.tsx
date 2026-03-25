'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DollarSign, Wallet, PieChart, CreditCard, ArrowUpRight, Loader2, AlertTriangle, Check } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface KpiData {
  pendingBookings: number;
  activeStaff: number;
  newClientsThisMonth: number;
  revenueThisMonth: number;
}

interface Payout {
  id: number;
  status: string;
  totalEarned: number;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  staff: { user: { name: string; email: string } };
}

export default function AdminFinancialsPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const [k, p] = await Promise.all([api.admin.getKpis(), api.admin.getPayouts()]);
    setKpis(k);
    setPayouts(p);
  };

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, []);

  const markPaid = async (id: number) => {
    setMarkingPaid(id);
    try {
      await fetchWithAuth(`/admin/payouts/${id}/mark-paid`, { method: 'POST' });
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMarkingPaid(null);
    }
  };

  const generatePayouts = async () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    setGenerating(true);
    try {
      const result = await fetchWithAuth('/admin/payouts/generate', {
        method: 'POST',
        body: JSON.stringify({ periodStart: start, periodEnd: end }),
      });
      alert(`Generated ${result.count} payout record(s).`);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const revenue = Number(kpis?.revenueThisMonth ?? 0);
  const pendingPayoutTotal = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.totalEarned), 0);

  const stats = [
    { label: 'Revenue (This Month)', value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Payouts', value: `$${pendingPayoutTotal.toFixed(2)}`, icon: Wallet, color: 'text-amber-600 bg-amber-50' },
    { label: 'Est. Net Profit', value: `$${(revenue - pendingPayoutTotal).toFixed(2)}`, icon: PieChart, color: 'text-sage-600 bg-sage-50' },
    { label: 'New Clients', value: kpis?.newClientsThisMonth ?? 0, icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Financials</h1>
          <p className="text-neutral-500 text-sm mt-1">Revenue, payouts, and net profit overview</p>
        </div>
        <button
          onClick={generatePayouts}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-600 text-white rounded-xl text-sm font-semibold hover:bg-sage-700 transition-all disabled:opacity-60 shadow-sm"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
          Generate Month Payouts
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className={`p-2.5 rounded-xl w-fit mb-4 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
            <p className="text-sm text-neutral-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Payout queue */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">Staff Payout Queue</h2>
          <span className="text-xs text-neutral-400 font-medium">{payouts.filter(p => p.status === 'pending').length} pending</span>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Wallet className="w-10 h-10 mx-auto mb-3 text-neutral-200" />
            <p className="text-sm font-medium">No payouts generated yet.</p>
            <p className="text-xs mt-1">Click "Generate Month Payouts" above to create payout records from completed bookings.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {payouts.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors flex-wrap">
                <div className="w-10 h-10 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {p.staff.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm">{p.staff.user.name}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(p.periodStart).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} –{' '}
                    {new Date(p.periodEnd).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right mr-2">
                  <p className="font-bold text-neutral-900">${Number(p.totalEarned).toFixed(2)}</p>
                </div>
                {p.status === 'pending' ? (
                  <button
                    onClick={() => markPaid(p.id)}
                    disabled={markingPaid === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 border border-sage-200 text-sage-700 hover:bg-sage-50 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                  >
                    {markingPaid === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Mark Paid
                  </button>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sage-50 text-sage-700 px-2 py-1 rounded-lg">Paid</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
