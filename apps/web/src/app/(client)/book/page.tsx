import BookingWizard from '@/components/booking/BookingWizard';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Service | Sit Happens',
};

export default function ClientBookingPage() {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-warm-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold text-sage-800">
          Sit Happens.
        </Link>
        <Link href="/dashboard" className="text-sm text-warm-600 hover:text-sage-600 font-medium transition-colors">
          ← My Dashboard
        </Link>
      </header>

      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-sage-900">Book a Service</h1>
            <p className="mt-2 text-warm-600 text-sm">
              Complete the steps below to schedule a visit for your pet.
            </p>
          </div>
          <BookingWizard />
        </div>
      </div>
    </div>
  );
}
