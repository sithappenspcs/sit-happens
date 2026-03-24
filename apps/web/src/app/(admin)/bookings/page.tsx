'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Check, X, ShieldAlert, CreditCard, Clock, MapPin, User, Search, Filter } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.admin.getBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.admin.approveBooking(id);
      loadBookings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRefund = async (id: number) => {
    if (!confirm('Are you sure you want to issue a full refund for this booking?')) return;
    try {
      await api.admin.refundBooking(id);
      loadBookings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-playfair text-neutral-900">Booking Management</h1>
        <div className="flex space-x-2">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input type="text" placeholder="Search bookings..." className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-sage-500 focus:border-sage-500" />
            </div>
            <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium flex items-center hover:bg-neutral-50">
                <Filter className="w-4 h-4 mr-2" />
                Filters
            </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100">
              <th className="px-6 py-4">Booking Info</th>
              <th className="px-6 py-4">Client / Pet</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-900">{booking.package.name}</span>
                    <span className="text-xs text-neutral-500 flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-800">{booking.client.user.name}</span>
                    <span className="text-xs text-neutral-400">ID: BK-{booking.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${
                    booking.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    booking.status === 'approved' ? 'bg-sage-50 text-sage-700' :
                    booking.status === 'completed' ? 'bg-neutral-100 text-neutral-600' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-neutral-900">${Number(booking.totalCharged).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleApprove(booking.id)}
                        className="p-2 text-sage-600 hover:bg-sage-50 rounded-lg transition-colors border border-transparent hover:border-sage-100"
                        title="Approve & Capture Payment"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    {booking.status === 'approved' && (
                        <button 
                           onClick={() => handleRefund(booking.id)}
                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                           title="Issue Refund"
                        >
                            <CreditCard className="w-5 h-5" />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {bookings.length === 0 && !loading && (
            <div className="p-12 text-center">
                <ShieldAlert className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                <p className="text-neutral-500 font-medium">No bookings found in the queue.</p>
            </div>
        )}

        {loading && (
            <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-sage-200 mx-auto mb-4 animate-pulse" />
                <p className="text-neutral-500 font-medium">Crunching data...</p>
            </div>
        )}
      </div>
    </div>
  );
}
