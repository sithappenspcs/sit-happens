'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, PawPrint, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'My Bookings', icon: Calendar, href: '/dashboard/bookings' },
  { label: 'My Pets', icon: PawPrint, href: '/dashboard/pets' },
];

function ClientNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active ? 'bg-sage-600 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-neutral-100">
          <Link href="/" className="text-xl font-serif font-bold">
            Sit Happens<span className="text-sage-600">.</span>
          </Link>
          <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-semibold">Client Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLinks />
          <div className="pt-3">
            <Link href="/book" className="flex items-center gap-3 px-3 py-2.5 bg-sage-50 border border-sage-100 text-sage-700 rounded-xl text-sm font-semibold hover:bg-sage-100 transition-all">
              <Calendar className="w-4 h-4" />
              Book a Service
            </Link>
          </div>
        </nav>
        <div className="p-3 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-warm-100 text-warm-700 rounded-full flex items-center justify-center text-xs font-bold">
              {(user?.email || 'C').charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-bold text-neutral-900 truncate flex-1">{user?.email}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="text-lg font-serif font-bold">Sit Happens<span className="text-sage-600">.</span></span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 space-y-1 pt-16" onClick={e => e.stopPropagation()}>
            <NavLinks />
            <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium mt-4">
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="client">
      <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
        <ClientNav />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
