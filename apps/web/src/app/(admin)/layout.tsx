'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Briefcase, Settings, DollarSign, Bell, LogOut } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/auth';

function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Bookings', icon: Calendar, href: '/admin/bookings' },
    { label: 'Staff', icon: Briefcase, href: '/admin/staff' },
    { label: 'Clients', icon: Users, href: '/admin/clients' },
    { label: 'Financials', icon: DollarSign, href: '/admin/financials' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 hidden lg:flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-neutral-100">
        <Link href="/" className="text-xl font-serif font-black text-sage-700 tracking-tight">
          Sit Happens<span className="text-neutral-900">.</span>
        </Link>
        <div className="mt-1.5 bg-sage-50 text-sage-700 text-[10px] font-bold uppercase tracking-widest py-1 px-2 rounded inline-block border border-sage-100">
          Admin Console
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-neutral-900 truncate">{user?.email}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Administrator</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex min-h-screen bg-neutral-50">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
