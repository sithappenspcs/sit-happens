import { Lock, Plus, Trash2 } from 'lucide-react';

export default function AvailabilityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-neutral-900">Availability</h1>
          <p className="text-neutral-500 mt-1">Manage your time off and block dates from being booked.</p>
        </div>
        <button className="mt-4 sm:mt-0 flex flex-center items-center px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg font-medium shadow-sm transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Request Time Off
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start sm:items-center mb-8">
        <Lock className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Time off requests must be approved by an Admin if requested within 14 days of the date.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <h2 className="text-lg font-bold text-neutral-900">Upcoming Time Off</h2>
        </div>
        
        <ul className="divide-y divide-neutral-100">
          <li className="p-6 flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <p className="font-bold text-neutral-900">November 24 - November 28, 2026</p>
              <p className="text-sm text-neutral-500 mt-1">Thanksgiving Break</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <span className="bg-sage-100 text-sage-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Approved</span>
              <button className="text-neutral-400 hover:text-red-500 transition-colors p-2" title="Cancel Request">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </li>
          <li className="p-6 flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <p className="font-bold text-neutral-900">December 20 - December 26, 2026</p>
              <p className="text-sm text-neutral-500 mt-1">Christmas / Family Visit</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Pending Admin</span>
              <button className="text-neutral-400 hover:text-red-500 transition-colors p-2" title="Cancel Request">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden p-8 text-center mt-8">
         <p className="text-neutral-600 mb-4">Want automatic syncing with your personal calendar?</p>
         <button className="px-6 py-3 border border-neutral-300 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 hover:text-sage-600 transition-colors inline-flex items-center">
           Connect Google Calendar
         </button>
      </div>
    </div>
  );
}
