'use client';

import { useState, useEffect } from 'react';
import { Save, Bell, Mail, Info, RefreshCw, Loader2, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'general' | 'scheduling'>('notifications');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock templates for visual - in reality, GET /admin/settings/templates
  useEffect(() => {
    setTemplates([
      { key: 'EMAIL_BOOKING_APPROVED', name: 'Booking Approval Email', channel: 'email', value: 'Subject: Your booking is approved!\n\nHi {{clientName}}, your booking for {{startTime}} has been approved.' },
      { key: 'EMAIL_INCIDENT_REPORT_ADMIN', name: 'Incident Alert (Admin)', channel: 'email', value: 'Subject: URGENT: New Incident Reported\n\nStaff {{staffName}} reported a {{severity}} severity issue: {{description}}' },
      { key: 'IN_APP_JOB_ASSIGNED', name: 'Job Assignment Notification', channel: 'in_app', value: 'You have a new booking assigned for {{startTime}} at {{address}}.' }
    ]);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // PUT /admin/settings
    setTimeout(() => {
        setSaving(false);
        alert('Settings saved successfully');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-neutral-900">System Settings</h1>
          <p className="text-neutral-500 mt-1">Configure global business logic and notification templates.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-sage-600 text-white rounded-xl font-bold shadow-md hover:bg-sage-700 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="flex space-x-8">
        {/* Navigation Sidebar */}
        <div className="w-64 space-y-1">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'scheduling', label: 'Scheduling Engine', icon: RefreshCw },
            { id: 'general', label: 'General Styling', icon: Info },
          ].map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                 activeTab === tab.id ? 'bg-sage-600 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100'
               }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {templates.map((template, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {template.channel === 'email' ? <Mail className="w-5 h-5 text-neutral-400" /> : <Bell className="w-5 h-5 text-neutral-400" />}
                      <span className="text-sm font-bold text-neutral-900">{template.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{template.key}</span>
                  </div>
                  <div className="p-6">
                    <textarea 
                       className="w-full font-mono text-sm border-neutral-200 rounded-xl p-4 min-h-[150px] bg-neutral-50 focus:bg-white focus:ring-sage-500 focus:border-sage-500 transition-all"
                       defaultValue={template.value}
                    />
                    <div className="mt-3 flex items-center space-x-2">
                        <span className="text-xs text-neutral-400">Available Variables:</span>
                        <code className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">{"{{clientName}}"}</code>
                        <code className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">{"{{startTime}}"}</code>
                        <code className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">{"{{address}}"}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm space-y-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Engine Constraints</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-neutral-700">Default Travel Budget (min)</label>
                  <p className="text-xs text-neutral-500">How much time to allocate between visits for travel.</p>
                  <input type="number" defaultValue={30} className="w-full border-neutral-200 rounded-lg p-3" />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-neutral-700">Warning Threshold (%)</label>
                  <p className="text-xs text-neutral-500">Percentage of max absence before Real-time warning is sent.</p>
                  <input type="number" defaultValue={80} className="w-full border-neutral-200 rounded-lg p-3" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
