'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Check, X, CreditCard, Clock, Search, Filter, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';

interface Booking {
  id: number;
  status: string;
  startTime: string;
  endTime: string;
  totalCharged: number;
  clientNotes: string | null;
  client: { id: number; address: string | null; user: { name: string; email: string } };
  package: { name: string };
  staff: { id: number; user: { name: string } } | null;
}

interface StaffOption {
  id: number;
  user: { name: string };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [approving, setApproving] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Record<number, number>>({});
  const [declineReason, setDeclineReason] = useState<Record<number, string>>({});

  const loadData = async () => {
    try {
      const [bookingData, staffData] = await Promise.all([
        api.admin.getBookings(),
        api.admin.getStaff(),
      ]);
      setBookings(bookingData);
      setStaffList(staffData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id: number) => {
    const staffId = selectedStaff[id];
    if (!staffId) { alert('Please select a staff member to assign before approving.'); return; }
    setApproving(id);
    try {
      await api.admin.approveBooking(id, staffId);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(null);
    }
  };

  const handleDecline = async (id: number) => {
    const reason = declineReason[id] || 'Scheduling conflict';
    if (!confirm(`Decline this booking? Reason: "${reason}"`)) return;
    try {
      await api.admin.declineBooking(id, reason);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRefund = async (id: number) => {
    if (!confirm('Issue a full refund for this booking?')) return;
    try {
      await api.admin.refundBooking(id);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.client.user.name.toLowerCase().includes(search.toLowerCase()) ||
      b.package.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="font-bold text-red-900">Failed to load bookings</p>
      <p className="text-red-700 text-sm mt-1">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Booking Management</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {bookings.filter((b) => b.status === 'pending').length} pending approval
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none bg-white w-56"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none bg-white appearance-none cursor-pointer"
            >
              {['all', 'pending', 'approved', 'active', 'completed', 'cancelled', 'declined'].map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((booking) => (
          <div key={booking.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors">
            <div className="flex flex-wrap items-center gap-4 p-5">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-neutral-900">{booking.client.user.name}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${statusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {booking.package.name} · {new Date(booking.startTime).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {booking.staff && (
                  <p className="text-xs text-sage-600 mt-1 font-medium">Assigned: {booking.staff.user.name}</p>
                )}
                {booking.clientNotes && (
                  <p className="text-xs text-neutral-400 mt-1 italic">"{booking.clientNotes}"</p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-bold text-neutral-900">${Number(booking.totalCharged).toFixed(2)}</p>
                <p className="text-xs text-neutral-400">BK-{booking.id}</p>
              </div>

              {/* Actions */}
              {booking.status === 'pending' && (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <select
                    value={selectedStaff[booking.id] || ''}
                    onChange={(e) => setSelectedStaff((prev) => ({ ...prev, [booking.id]: Number(e.target.value) }))}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:border-sage-400 outline-none bg-white"
                  >
                    <option value="">Assign staff member...</option>
                    {staffList.filter((s: any) => s.isActive).map((s) => (
                      <option key={s.id} value={s.id}>{s.user.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Decline reason (optional)"
                    value={declineReason[booking.id] || ''}
                    onChange={(e) => setDeclineReason((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:border-sage-400 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      disabled={approving === booking.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                    >
                      {approving === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(booking.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {booking.status === 'approved' && (
                <button
                  onClick={() => handleRefund(booking.id)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Refund
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400">
            <Clock className="w-10 h-10 mx-auto mb-3 text-neutral-200" />
            <p className="font-medium">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
