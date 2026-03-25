'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, DollarSign, ClipboardList, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/staff' },
  { label: 'Schedule', icon: Calendar, href: '/staff/schedule' },
  { label: 'Earnings', icon: DollarSign, href: '/staff/earnings' },
  { label: 'Availability', icon: ClipboardList, href: '/staff/availability' },
];

function StaffNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user?.email || 'S').substring(0, 2).toUpperCase();

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== '/staff' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
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
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-neutral-100">
          <Link href="/" className="text-xl font-serif font-bold text-neutral-900">
            Sit Happens<span className="text-sage-600">.</span>
          </Link>
          <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-semibold">Staff Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">{user?.email}</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Staff</p>
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

      {/* Mobile header */}
      <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="text-lg font-serif font-bold text-neutral-900">Sit Happens<span className="text-sage-600">.</span></span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-neutral-600">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 space-y-1 pt-16" onClick={e => e.stopPropagation()}>
            <NavLinks />
            <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium mt-4">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="staff">
      <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
        <StaffNav />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
