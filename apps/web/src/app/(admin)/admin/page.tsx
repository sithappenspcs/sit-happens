'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Calendar, Users, Briefcase, DollarSign,
  ArrowRight, Clock, CheckCircle, AlertTriangle, Loader2,
} from 'lucide-react';

interface KpiData {
  pendingBookings: number;
  activeStaff: number;
  newClientsThisMonth: number;
  revenueThisMonth: number;
}

interface Booking {
  id: number;
  status: string;
  startTime: string;
  totalCharged: number;
  client: { user: { name: string } };
  package: { name: string };
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.admin.getKpis(), api.admin.getBookings()])
      .then(([kpiData, bookingData]) => {
        setKpis(kpiData);
        setRecentBookings(bookingData.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="font-bold text-red-900">Failed to load dashboard</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Pending Bookings',
      value: kpis?.pendingBookings ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      href: '/admin/bookings',
    },
    {
      label: 'Active Staff',
      value: kpis?.activeStaff ?? 0,
      icon: Briefcase,
      color: 'text-sage-600 bg-sage-50',
      href: '/admin/staff',
    },
    {
      label: 'New Clients (Month)',
      value: kpis?.newClientsThisMonth ?? 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      href: '/admin/clients',
    },
    {
      label: 'Revenue (Month)',
      value: `$${Number(kpis?.revenueThisMonth ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
      href: '/admin/financials',
    },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'approved': return 'bg-sage-50 text-sage-700';
      case 'active': return 'bg-blue-50 text-blue-700';
      case 'completed': return 'bg-neutral-100 text-neutral-600';
      case 'cancelled':
      case 'declined': return 'bg-red-50 text-red-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl border border-neutral-200 p-6 hover:border-sage-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-sage-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-neutral-900 mt-4">{card.value}</p>
            <p className="text-sm text-neutral-500 mt-0.5 font-medium">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="font-bold text-neutral-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentBookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-neutral-400 text-sm">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
                No bookings yet
              </div>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{b.client.user.name}</p>
                    <p className="text-xs text-neutral-500">{b.package.name} · {new Date(b.startTime).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="font-bold text-neutral-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Review pending bookings', href: '/admin/bookings', icon: Clock, desc: `${kpis?.pendingBookings ?? 0} awaiting approval` },
              { label: 'Manage staff roster', href: '/admin/staff', icon: Briefcase, desc: `${kpis?.activeStaff ?? 0} active sitters` },
              { label: 'View client accounts', href: '/admin/clients', icon: Users, desc: 'Manage all clients' },
              { label: 'Financial reports', href: '/admin/financials', icon: DollarSign, desc: 'Payouts & revenue' },
              { label: 'System settings', href: '/admin/settings', icon: Calendar, desc: 'Templates & scheduling' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center group-hover:bg-sage-50 group-hover:text-sage-600 text-neutral-500 transition-colors flex-shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">{item.label}</p>
                  <p className="text-xs text-neutral-400">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-sage-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
