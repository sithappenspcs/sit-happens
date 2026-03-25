'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Save, Bell, Mail, RefreshCw, Loader2, Check } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
}

const EMAIL_TEMPLATE_KEYS = [
  { key: 'EMAIL_MAGIC_LINK',          name: 'Magic Link Login Email',       channel: 'email' },
  { key: 'EMAIL_NEW_BOOKING_ADMIN',   name: 'New Booking (Admin Alert)',     channel: 'email' },
  { key: 'EMAIL_BOOKING_APPROVED',    name: 'Booking Approved (Client)',     channel: 'email' },
  { key: 'EMAIL_BOOKING_DECLINED',    name: 'Booking Declined (Client)',     channel: 'email' },
  { key: 'EMAIL_JOB_ASSIGNED',        name: 'Job Assignment (Staff)',        channel: 'email' },
  { key: 'EMAIL_INCIDENT_REPORT_ADMIN', name: 'Incident Report (Admin)',     channel: 'email' },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<'notifications' | 'scheduling'>('notifications');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWithAuth('/admin/settings')
      .then((data: Setting[]) => {
        const map: Record<string, string> = {};
        data.forEach(s => { map[s.key] = s.value; });
        setSettings(map);
        setDirty(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setDirty(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed = Object.entries(dirty)
        .filter(([k, v]) => v !== settings[k])
        .map(([key, value]) => ({ key, value }));

      if (changed.length === 0) { setSaving(false); return; }

      await fetchWithAuth('/admin/settings/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ settings: changed }),
      });
      setSettings({ ...dirty });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">System Settings</h1>
          <p className="text-neutral-500 text-sm mt-1">Email templates and scheduling configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit">
        {[
          { id: 'notifications', label: 'Email Templates', icon: Bell },
          { id: 'scheduling', label: 'Scheduling', icon: RefreshCw },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Email templates */}
      {tab === 'notifications' && (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">
            Templates support <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono">{`{{variable}}`}</code> interpolation.
            First line must be <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono">Subject: ...</code>
          </p>
          {EMAIL_TEMPLATE_KEYS.map(t => (
            <div key={t.key} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  {t.channel === 'email' ? <Mail className="w-4 h-4 text-neutral-400" /> : <Bell className="w-4 h-4 text-neutral-400" />}
                  <span className="text-sm font-bold text-neutral-900">{t.name}</span>
                </div>
                <code className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">{t.key}</code>
              </div>
              <div className="p-4">
                <textarea
                  value={dirty[t.key] ?? ''}
                  onChange={e => handleChange(t.key, e.target.value)}
                  rows={6}
                  className="w-full font-mono text-xs border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none resize-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheduling config */}
      {tab === 'scheduling' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
          <h2 className="font-bold text-neutral-900">Scheduling Engine Parameters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { key: 'SCHEDULING_TRAVEL_BUDGET_MIN', label: 'Default Travel Budget (minutes)', desc: 'Time buffer allocated between consecutive visits for travel.', default: '30' },
              { key: 'SCHEDULING_WARNING_THRESHOLD_PCT', label: 'Absence Warning Threshold (%)', desc: 'When % of max absence window is reached, a real-time warning is emitted.', default: '80' },
              { key: 'SCHEDULING_SLOT_INTERVAL_MIN', label: 'Slot Interval (minutes)', desc: 'Frequency of time slots shown to clients when booking.', default: '30' },
              { key: 'SCHEDULING_WINDOW_START_HOUR', label: 'Booking Window Start (24h)', desc: 'Earliest hour available for booking slots.', default: '8' },
              { key: 'SCHEDULING_WINDOW_END_HOUR', label: 'Booking Window End (24h)', desc: 'Latest hour available for booking slots.', default: '20' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-bold text-neutral-700 mb-1">{f.label}</label>
                <p className="text-xs text-neutral-400 mb-2">{f.desc}</p>
                <input
                  type="number"
                  value={dirty[f.key] ?? f.default}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
