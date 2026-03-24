import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

export default function StaffSchedulePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-neutral-900">Your Schedule</h1>
          <p className="text-neutral-500 mt-1">View your upcoming jobs and block out personal time.</p>
        </div>
      </div>

      {/* Calendar / Availability Wrapper */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-4">
            <button className="p-2 border border-neutral-200 bg-white rounded-lg shadow-sm hover:bg-neutral-50 transition-colors">
              <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-lg font-bold text-neutral-900">October 2026</h2>
            <button className="p-2 border border-neutral-200 bg-white rounded-lg shadow-sm hover:bg-neutral-50 transition-colors">
              <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2 text-sm">
            <span className="flex items-center text-neutral-600"><span className="w-3 h-3 rounded-full bg-sage-500 mr-2"></span>Jobs</span>
            <span className="flex items-center text-neutral-600 ml-4"><span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>Time Off</span>
          </div>
        </div>
        
        <div className="p-8 text-center text-neutral-500 min-h-[400px] flex flex-col items-center justify-center">
          <CalendarIcon className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 mb-2">Calendar Under Construction</h3>
          <p className="max-w-md mx-auto">This UI component will render a full month schedule using react-big-calendar or a custom grid when hooked up to the Google Calendar sync API in Phase 11.</p>
        </div>
      </div>
    </div>
  );
}
