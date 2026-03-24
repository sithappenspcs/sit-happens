import { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Calendar, Users, Briefcase, Settings, DollarSign, PieChart } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Bookings', icon: Calendar, href: '/admin/bookings' },
    { label: 'Staff', icon: Briefcase, href: '/admin/staff' },
    { label: 'Clients', icon: Users, href: '/admin/clients' },
    { label: 'Financials', icon: DollarSign, href: '/admin/financials' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden lg:block sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="text-2xl font-playfair font-black text-sage-600 tracking-tight">
            Sit Happens<span className="text-neutral-900 font-bold">.</span>
          </Link>
          <div className="mt-1 bg-neutral-100 text-[10px] font-bold uppercase tracking-widest text-neutral-500 py-1 px-2 rounded inline-block">
            Admin Console
          </div>
        </div>
        
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 text-neutral-600 hover:text-sage-600 hover:bg-sage-50 rounded-xl transition-all font-medium"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Global Overview</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-white rounded-full border border-neutral-200 shadow-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              <span className="sr-only">Notifications</span>
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white"></div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-neutral-200">
              <div className="w-10 h-10 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center font-bold">AD</div>
              <div>
                <p className="text-sm font-bold text-neutral-900 leading-tight">Admin User</p>
                <p className="text-xs text-neutral-500">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}
