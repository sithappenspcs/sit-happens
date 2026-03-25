'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Calendar, PawPrint, ArrowRight, Clock, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

interface Booking {
  id: number;
  status: string;
  startTime: string;
  package: { name: string };
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.bookings.getAll(), api.pets.getAll()])
      .then(([b, p]) => { setBookings(b); setPets(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcomingBookings = bookings.filter((b) =>
    ['pending', 'approved', 'active'].includes(b.status)
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'approved': return 'bg-sage-50 text-sage-700';
      case 'active': return 'bg-blue-50 text-blue-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your bookings and pets below.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-sage-50 rounded-xl"><Calendar className="w-4 h-4 text-sage-600" /></div>
            <p className="text-sm font-semibold text-neutral-600">Upcoming</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{upcomingBookings.length}</p>
          <p className="text-xs text-neutral-400 mt-0.5">bookings</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warm-50 rounded-xl"><PawPrint className="w-4 h-4 text-warm-600" /></div>
            <p className="text-sm font-semibold text-neutral-600">My Pets</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{pets.length}</p>
          <p className="text-xs text-neutral-400 mt-0.5">registered</p>
        </div>
      </div>

      {/* Book now CTA */}
      <Link href="/book" className="flex items-center justify-between bg-sage-600 hover:bg-sage-700 text-white rounded-2xl p-6 transition-all group shadow-sm">
        <div>
          <p className="font-bold text-lg">Book a Service</p>
          <p className="text-sage-200 text-sm mt-0.5">Schedule a visit, walk, or house sit</p>
        </div>
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">Upcoming Bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-neutral-50">
          {upcomingBookings.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-400 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
              No upcoming bookings. <Link href="/book" className="text-sage-600 font-medium hover:underline">Book a service</Link>
            </div>
          ) : (
            upcomingBookings.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors">
                <div className="p-2 bg-neutral-50 rounded-xl">
                  <Clock className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">{b.package.name}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(b.startTime).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${statusColor(b.status)}`}>
                  {b.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pets */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">My Pets</h2>
          <Link href="/dashboard/pets" className="text-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          {pets.map((pet) => (
            <div key={pet.id} className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
              <div className="w-9 h-9 bg-warm-100 text-warm-600 rounded-full flex items-center justify-center font-bold text-sm">
                {pet.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">{pet.name}</p>
                <p className="text-xs text-neutral-400">{pet.breed || pet.species}</p>
              </div>
            </div>
          ))}
          {pets.length === 0 && (
            <Link href="/dashboard/pets" className="flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium p-2">
              <PawPrint className="w-4 h-4" /> Add your first pet
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
