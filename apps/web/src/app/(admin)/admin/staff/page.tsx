'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, AlertTriangle, UserCheck, UserX, MapPin, Star } from 'lucide-react';

interface StaffMember {
  id: number;
  isActive: boolean;
  radiusKm: number;
  commissionPct: number;
  bio: string | null;
  certifications: string[];
  user: { id: number; name: string; email: string; phone: string | null; avatarUrl: string | null };
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.getStaff()
      .then(setStaff)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (staffId: number, currentlyActive: boolean) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/admin/staff/${staffId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ isActive: !currentlyActive }),
        }
      );
      setStaff((prev) => prev.map((s) => s.id === staffId ? { ...s, isActive: !currentlyActive } : s));
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="font-bold text-red-900">Failed to load staff</p>
      <p className="text-red-700 text-sm mt-1">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Staff Roster</h1>
          <p className="text-sm text-neutral-500 mt-1">{staff.filter(s => s.isActive).length} active sitters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div key={member.id} className={`bg-white rounded-2xl border p-6 transition-all ${member.isActive ? 'border-neutral-200' : 'border-neutral-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {member.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{member.user.name}</p>
                  <p className="text-xs text-neutral-400">{member.user.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${member.isActive ? 'bg-sage-50 text-sage-700' : 'bg-neutral-100 text-neutral-500'}`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {member.bio && (
              <p className="text-xs text-neutral-500 mb-4 line-clamp-2">{member.bio}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-neutral-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Radius</span>
                </div>
                <p className="text-sm font-bold text-neutral-800">{member.radiusKm} km</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-3 h-3 text-neutral-400" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Commission</span>
                </div>
                <p className="text-sm font-bold text-neutral-800">{(member.commissionPct * 100).toFixed(0)}%</p>
              </div>
            </div>

            {member.certifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.certifications.map((cert) => (
                  <span key={cert} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {cert}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => toggleActive(member.id, member.isActive)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all border ${
                member.isActive
                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                  : 'border-sage-200 text-sage-600 hover:bg-sage-50'
              }`}
            >
              {member.isActive ? <><UserX className="w-4 h-4" /> Deactivate</> : <><UserCheck className="w-4 h-4" /> Activate</>}
            </button>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="col-span-3 text-center py-16 text-neutral-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
            <p className="font-medium">No staff members yet.</p>
            <p className="text-sm mt-1">Staff accounts are created via the register endpoint with role="staff".</p>
          </div>
        )}
      </div>
    </div>
  );
}
