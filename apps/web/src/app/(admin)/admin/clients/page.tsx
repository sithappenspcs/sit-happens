'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, AlertTriangle, Search, PawPrint, MapPin, Flag } from 'lucide-react';

interface ClientRecord {
  id: number;
  address: string | null;
  creditBalance: number;
  lifetimeValue: number;
  isFlagged: boolean;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  pets: { id: number; name: string; species: string }[];
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.admin.getClients()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase()) ||
    c.user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="font-bold text-red-900">Failed to load clients</p>
      <p className="text-red-700 text-sm mt-1">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Client Accounts</h1>
          <p className="text-sm text-neutral-500 mt-1">{clients.length} registered clients</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none w-72 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Pets</th>
              <th className="px-6 py-3 text-left">Location</th>
              <th className="px-6 py-3 text-right">Lifetime Value</th>
              <th className="px-6 py-3 text-right">Credits</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((client) => (
              <tr key={client.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-warm-100 text-warm-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {client.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{client.user.name}</p>
                      <p className="text-xs text-neutral-400">{client.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <PawPrint className="w-3.5 h-3.5 text-neutral-300" />
                    <span className="text-sm text-neutral-600">
                      {client.pets.length === 0
                        ? 'None'
                        : client.pets.map((p) => p.name).join(', ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {client.address ? (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                      <span className="text-xs text-neutral-500 max-w-[180px] truncate">{client.address}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-300">No address</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-neutral-900">${Number(client.lifetimeValue).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-semibold ${Number(client.creditBalance) > 0 ? 'text-emerald-600' : 'text-neutral-400'}`}>
                    ${Number(client.creditBalance).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {client.isFlagged ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                      <Flag className="w-3 h-3" /> Flagged
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sage-50 text-sage-600 px-2 py-1 rounded-lg">
                      Active
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <Search className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
            <p className="text-sm font-medium">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
