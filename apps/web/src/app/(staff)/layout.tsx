import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Calendar, DollarSign, Settings, LogOut, ClipboardList } from 'lucide-react';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-2xl font-playfair font-bold text-neutral-900">Sit Happens<span className="text-sage-600">.</span></h2>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-semibold">Staff Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link href="/staff" className="flex items-center px-3 py-2.5 text-sage-700 bg-sage-50 rounded-lg font-medium transition-colors">
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/staff/schedule" className="flex items-center px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg font-medium transition-colors">
            <Calendar className="w-5 h-5 mr-3" />
            Schedule
          </Link>
          <Link href="/staff/earnings" className="flex items-center px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg font-medium transition-colors">
            <DollarSign className="w-5 h-5 mr-3" />
            Earnings
          </Link>
          <Link href="/staff/availability" className="flex items-center px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg font-medium transition-colors">
            <ClipboardList className="w-5 h-5 mr-3" />
            Availability
          </Link>
        </nav>
        
        <div className="p-4 border-t border-neutral-200">
          <button className="flex items-center w-full px-3 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg font-medium transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-neutral-200 p-4 md:hidden flex justify-between items-center">
          <h2 className="text-xl font-playfair font-bold text-neutral-900">Sit Happens</h2>
          <button className="p-2 text-neutral-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
