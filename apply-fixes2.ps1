$root = "C:\Users\Jstry\.gemini\antigravity\scratch\sit-happens"

# ── 1. auth.module.ts ──────────────────────────────────────────────
Set-Content "$root\apps\api\src\auth\auth.module.ts" @'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    PrismaModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your_jwt_secret_here_change_in_production',
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
'@
Write-Host "OK auth.module.ts" -ForegroundColor Green

# ── 2. staff-operations.controller.ts (just patch the one line) ────
$f = "$root\apps\api\src\staff-operations\staff-operations.controller.ts"
(Get-Content $f) -replace "@Roles\('staff'\)`r?`n  @Post\('availability'\)", "@Roles('staff', 'admin')`n  @Post('availability')" | Set-Content $f
Write-Host "OK staff-operations.controller.ts" -ForegroundColor Green

# ── 3. calendar.service.ts (just patch the one line) ──────────────
$f = "$root\apps\api\src\calendar\calendar.service.ts"
(Get-Content $f) -replace "|| 'default_secret'", "|| 'your_jwt_secret_here_change_in_production'" | Set-Content $f
Write-Host "OK calendar.service.ts" -ForegroundColor Green

# ── 4. availability page ───────────────────────────────────────────
Set-Content "$root\apps\web\src\app\(staff)\staff\availability\page.tsx" @'
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { addDays, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, isBefore, isAfter } from 'date-fns';
import { Check, X, Loader2, CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';

type DayState = 'available' | 'unavailable' | 'unset';
interface DayData { date: Date; state: DayState; saving: boolean; }

const TOTAL_MONTHS = 24;

export default function AvailabilityPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buildInitialDays = () => {
    const map = new Map<string, DayData>();
    const end = addDays(today, 365 * 2);
    let cur = new Date(today);
    while (!isAfter(cur, end)) {
      const key = format(cur, 'yyyy-MM-dd');
      map.set(key, { date: new Date(cur), state: 'unset', saving: false });
      cur = addDays(cur, 1);
    }
    return map;
  };

  const [days, setDays] = useState<Map<string, DayData>>(buildInitialDays);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isSavingRange, setIsSavingRange] = useState(false);
  const [note, setNote] = useState('');

  const viewDate = addMonths(startOfMonth(today), currentMonthIndex);
  const availableCount = [...days.values()].filter(d => d.state === 'available').length;

  const isInRange = (date: Date) => {
    if (!rangeStart || !hoverDate) return false;
    const [s, e] = isBefore(rangeStart, hoverDate) ? [rangeStart, hoverDate] : [hoverDate, rangeStart];
    return !isBefore(date, s) && !isAfter(date, e);
  };

  const handleDayClick = async (date: Date) => {
    if (isBefore(date, today)) return;
    if (!rangeStart) { setRangeStart(date); return; }

    const [start, end] = isBefore(rangeStart, date) ? [rangeStart, date] : [date, rangeStart];
    const rangeDays = eachDayOfInterval({ start, end }).filter(d => !isBefore(d, today));
    const anyNotAvailable = rangeDays.some(d => days.get(format(d, 'yyyy-MM-dd'))?.state !== 'available');
    const targetState: DayState = anyNotAvailable ? 'available' : 'unavailable';

    setRangeStart(null);
    setHoverDate(null);
    setIsSavingRange(true);

    setDays(prev => {
      const next = new Map(prev);
      rangeDays.forEach(d => {
        const k = format(d, 'yyyy-MM-dd');
        const ex = next.get(k);
        if (ex) next.set(k, { ...ex, state: targetState, saving: true });
      });
      return next;
    });

    await Promise.all(rangeDays.map(d =>
      api.staff.setAvailability({ date: format(d, 'yyyy-MM-dd'), isAvailable: targetState === 'available', notes: note || undefined }).catch(() => null)
    ));

    setDays(prev => {
      const next = new Map(prev);
      rangeDays.forEach(d => {
        const k = format(d, 'yyyy-MM-dd');
        const ex = next.get(k);
        if (ex) next.set(k, { ...ex, saving: false });
      });
      return next;
    });
    setIsSavingRange(false);
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = (getDay(monthStart) + 6) % 7;
  const gridDays: (Date | null)[] = [...Array(startOffset).fill(null), ...daysInMonth];
  while (gridDays.length % 7 !== 0) gridDays.push(null);

  const getDayData = (date: Date) => days.get(format(date, 'yyyy-MM-dd'));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">My Availability</h1>
        <p className="text-neutral-500 text-sm mt-1">Click a start date, then click an end date to mark a range. Works for single days too.</p>
      </div>

      <div className="bg-sage-50 border border-sage-100 rounded-2xl p-4 flex items-center gap-4">
        <CalendarCheck className="w-5 h-5 text-sage-600 flex-shrink-0" />
        <p className="text-sm text-sage-800">
          Available on <strong>{availableCount}</strong> day{availableCount !== 1 ? 's' : ''} in the next 2 years.
          {isSavingRange && <span className="ml-2 text-sage-600"><Loader2 className="w-3 h-3 inline animate-spin" /> Saving...</span>}
        </p>
      </div>

      {rangeStart && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-amber-800 font-medium">Start: <strong>{format(rangeStart, 'MMM d, yyyy')}</strong> — now click an end date</span>
          <button onClick={() => { setRangeStart(null); setHoverDate(null); }} className="text-amber-600 hover:text-amber-800 font-semibold ml-4">Cancel</button>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Available after 9am only"
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none" />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <button onClick={() => setCurrentMonthIndex(i => Math.max(0, i - 1))} disabled={currentMonthIndex === 0}
            className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-bold text-neutral-900 text-sm">{format(viewDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonthIndex(i => Math.min(TOTAL_MONTHS - 1, i + 1))} disabled={currentMonthIndex >= TOTAL_MONTHS - 1}
            className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-neutral-100">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {gridDays.map((date, idx) => {
            if (!date) return <div key={`e-${idx}`} className="aspect-square border-b border-r border-neutral-50" />;
            const data = getDayData(date);
            const isPast = isBefore(date, today);
            const isToday = isSameDay(date, today);
            const inRange = isInRange(date);
            const isStart = rangeStart && isSameDay(date, rangeStart);
            const state = data?.state ?? 'unset';

            let cls = 'bg-white text-neutral-600 border border-neutral-100 hover:bg-neutral-50';
            if (isPast) cls = 'bg-neutral-50 text-neutral-300 cursor-not-allowed';
            else if (state === 'available') cls = 'bg-sage-600 text-white hover:bg-sage-700';
            else if (state === 'unavailable') cls = 'bg-red-50 text-red-400 border border-red-100 hover:bg-red-100';
            if (inRange && !isPast) cls = 'bg-sage-100 text-sage-700 border border-sage-200';
            if (isStart) cls = 'bg-sage-500 text-white ring-2 ring-sage-300';

            return (
              <div key={format(date, 'yyyy-MM-dd')} className="aspect-square border-b border-r border-neutral-50 p-0.5">
                <button onClick={() => !isPast && handleDayClick(date)}
                  onMouseEnter={() => rangeStart && setHoverDate(date)}
                  disabled={isPast || data?.saving}
                  className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all ${cls} ${isToday ? 'ring-2 ring-amber-400' : ''}`}>
                  {data?.saving ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                    <>
                      <span className="text-xs font-bold leading-none">{format(date, 'd')}</span>
                      {isToday && <span className="text-[8px] font-bold opacity-70">Today</span>}
                      {state === 'available' && !isToday && <Check className="w-2.5 h-2.5" />}
                      {state === 'unavailable' && <X className="w-2.5 h-2.5" />}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 flex-wrap">
        {Array.from({ length: TOTAL_MONTHS }, (_, i) => (
          <button key={i} onClick={() => setCurrentMonthIndex(i)}
            className={`h-2 rounded-full transition-all ${i === currentMonthIndex ? 'bg-sage-600 w-4' : 'bg-neutral-200 hover:bg-neutral-400 w-2'}`} />
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm text-neutral-500 pb-4">
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-sage-600 rounded" />Available</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-red-50 border border-red-100 rounded" />Unavailable</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-white border border-neutral-100 rounded" />Not set</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded ring-2 ring-amber-400" />Today</span>
      </div>
    </div>
  );
}
'@
Write-Host "OK availability/page.tsx" -ForegroundColor Green

# ── Git ────────────────────────────────────────────────────────────
Set-Location $root
git add apps/api/src/auth/auth.module.ts `
        apps/api/src/calendar/calendar.service.ts `
        apps/api/src/staff-operations/staff-operations.controller.ts `
        "apps/web/src/app/(staff)/staff/availability/page.tsx"
git commit -m "fix: admin login JWT secret, availability roles + 2-year calendar"
git push
Write-Host "All done! Now restart the API and run: npm run db:seed" -ForegroundColor Cyan
