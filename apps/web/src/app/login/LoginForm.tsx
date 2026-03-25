'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  useEffect(() => {
    if (!user) return;
    const dest = returnTo
      ? decodeURIComponent(returnTo)
      : user.role === 'admin' ? '/admin'
      : user.role === 'staff' ? '/staff'
      : '/dashboard';
    router.replace(dest);
  }, [user, returnTo, router]);

  const redirectAfterAuth = (role: string) => {
    const dest = returnTo
      ? decodeURIComponent(returnTo)
      : role === 'admin' ? '/admin'
      : role === 'staff' ? '/staff'
      : '/dashboard';
    router.push(dest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name, email, password);
      }
      const stored = localStorage.getItem('auth_user');
      const u = stored ? JSON.parse(stored) : null;
      redirectAfterAuth(u?.role || 'client');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="font-serif text-3xl font-bold text-sage-800">
          Sit Happens<span className="text-warm-400">.</span>
        </Link>
        <p className="mt-2 text-warm-600 text-sm">Premium pet care, tailored to your schedule</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-warm-100 px-8 py-10">
          <div className="flex bg-warm-50 rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map(m => (
              <button key={m} type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white text-sage-800 shadow-sm' : 'text-warm-500 hover:text-warm-700'
                }`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-warm-800 mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith" required
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 focus:bg-white focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all text-sm" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-warm-800 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 focus:bg-white focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-warm-800 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-warm-200 bg-warm-50 focus:bg-white focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-warm-100">
            <p className="text-xs text-warm-400 text-center font-medium mb-3">Dev credentials</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin', email: 'admin@sithappens.ca', pw: 'admin123' },
                { label: 'Staff', email: 'sarah@sithappens.ca', pw: 'staff123' },
                { label: 'Client', email: 'emma@example.com', pw: 'client123' },
              ].map(c => (
                <button key={c.label} type="button"
                  onClick={() => { setEmail(c.email); setPassword(c.pw); setMode('login'); setError(null); }}
                  className="text-xs bg-warm-50 border border-warm-200 rounded-lg py-2 px-2 text-warm-600 hover:bg-warm-100 font-medium transition-all">
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
