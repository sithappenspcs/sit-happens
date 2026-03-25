import Link from 'next/link';
import { Button } from '../../components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const PRICE_UNIT: Record<string, string> = {
  per_visit: '/ visit',
  per_night: '/ night',
  per_hour: '/ hr',
  flat: '',
};

async function getPackages() {
  try {
    const res = await fetch(`${API_URL}/api/v1/packages`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const packages = await getPackages();

  return (
    <main className="min-h-screen bg-warm-50">
      {/* Nav */}
      <header className="fixed w-full flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md z-50 border-b border-warm-100">
        <Link href="/" className="font-serif text-2xl font-bold text-sage-800">Sit Happens.</Link>
        <nav className="hidden md:flex gap-8 text-warm-800 font-medium text-sm">
          <Link href="/services" className="text-sage-600 font-semibold">Services</Link>
          <Link href="/about" className="hover:text-sage-600 transition-colors">About Us</Link>
          <Link href="/faq" className="hover:text-sage-600 transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-sage-600 transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-warm-700 hover:text-sage-600 hidden sm:block">Sign In</Link>
          <Link href="/book"><Button variant="primary">Book Now</Button></Link>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-sage-800">Our Services</h1>
            <p className="text-lg text-warm-700 max-w-2xl mx-auto">
              Every visit includes GPS tracking, real-time photo updates, and a detailed report card so you always know your pet is thriving.
            </p>
          </div>

          {/* Package grid */}
          {packages.length === 0 ? (
            <div className="text-center text-warm-500 py-16">
              <p className="text-lg">Services loading... Run the DB seed to populate packages.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-white rounded-3xl border border-warm-100 overflow-hidden shadow-sm hover:shadow-md hover:border-sage-200 transition-all flex flex-col">
                  {/* Header band */}
                  <div className="bg-gradient-to-br from-sage-50 to-warm-50 p-8 border-b border-warm-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-sage-900">{pkg.name}</h3>
                        {pkg.tagline && <p className="text-warm-600 mt-1 text-sm">{pkg.tagline}</p>}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-3xl font-bold text-sage-700">${Number(pkg.basePrice).toFixed(0)}</span>
                        <span className="text-warm-500 text-sm ml-1">{PRICE_UNIT[pkg.priceUnit] || ''}</span>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-warm-500 bg-white/60 rounded-full px-3 py-1 border border-warm-100">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {pkg.durationMinutes >= 60
                        ? `${pkg.durationMinutes / 60} hour${pkg.durationMinutes / 60 !== 1 ? 's' : ''}`
                        : `${pkg.durationMinutes} min`}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-8 flex-1 flex flex-col">
                    {pkg.description && (
                      <p className="text-warm-700 text-sm mb-5 leading-relaxed">{pkg.description}</p>
                    )}
                    {pkg.includedFeatures?.length > 0 && (
                      <ul className="space-y-2 mb-6 flex-1">
                        {pkg.includedFeatures.map((f: string) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm text-warm-700">
                            <span className="w-4 h-4 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="pt-4 border-t border-warm-100 mt-auto">
                      <Link href={`/book?package=${pkg.id}`}>
                        <Button variant="primary" className="w-full">Book This Service</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trust strip */}
          <div className="bg-white rounded-2xl border border-warm-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { emoji: '🔒', label: 'Bonded & Insured' },
              { emoji: '📍', label: 'GPS Tracked Visits' },
              { emoji: '📸', label: 'Photo Updates' },
              { emoji: '⭐', label: '5-Star Rated' },
            ].map(t => (
              <div key={t.label} className="space-y-2">
                <div className="text-3xl">{t.emoji}</div>
                <p className="text-sm font-semibold text-warm-800">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
