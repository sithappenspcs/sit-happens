'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'client';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Preserve destination so login can redirect back after auth
      const returnTo = encodeURIComponent(pathname);
      router.replace(`/login?returnTo=${returnTo}`);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Wrong role — send to their correct dashboard
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'staff') router.replace('/staff');
      else router.replace('/dashboard');
    }
  }, [user, loading, requiredRole, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
          <p className="text-sm text-neutral-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}
