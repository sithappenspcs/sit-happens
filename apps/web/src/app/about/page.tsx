import Link from 'next/link';
import { Button } from '../../components/ui/Button';

export default function AboutPage() {
  const team = [
    { name: 'Cassandra Bell', role: 'Founder & Lead Sitter', bio: '10+ years caring for animals. Certified in pet first aid. Former veterinary technician.' },
    { name: 'Sarah Johnson', role: 'Senior Sitter', bio: 'Dog handler certified. Specialises in high-energy breeds and multi-pet households.' },
    { name: 'Marcus Webb', role: 'Overnight Specialist', bio: 'Experienced with anxious pets and post-surgery care. Trusted by 200+ Edmonton families.' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <header className="fixed w-full flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md z-50 border-b border-warm-100">
        <Link href="/" className="font-serif text-2xl font-bold text-sage-800">Sit Happens.</Link>
        <nav className="hidden md:flex gap-8 text-warm-800 font-medium text-sm">
          <Link href="/services" className="hover:text-sage-600 transition-colors">Services</Link>
          <Link href="/about" className="text-sage-600 font-semibold">About Us</Link>
          <Link href="/faq" className="hover:text-sage-600 transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-sage-600 transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-warm-700 hover:text-sage-600 hidden sm:block">Sign In</Link>
          <Link href="/book"><Button variant="primary">Book Now</Button></Link>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-5xl font-bold text-sage-800">About Sit Happens</h1>
            <p className="text-xl text-warm-700 max-w-2xl mx-auto leading-relaxed">
              Founded in Edmonton, born from a simple idea: pet care should be reliable, transparent, and deeply personal.
            </p>
          </div>

          {/* Mission */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-sage-50 rounded-3xl border border-sage-100 p-8 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-sage-900">Our Mission</h2>
              <p className="text-warm-700 leading-relaxed">
                To give every pet parent complete peace of mind — through real-time updates, GPS-tracked visits, and sitters who treat your home and pets as their own.
              </p>
            </div>
            <div className="bg-warm-50 rounded-3xl border border-warm-100 p-8 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-warm-900">Our Promise</h2>
              <p className="text-warm-700 leading-relaxed">
                Every sitter on our platform is background-checked, bonded, insured, and pet-first-aid certified. We never send a stranger to your home — every sitter has met you and your pet first.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Happy Pets Served' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '3', label: 'Years in Edmonton' },
              { value: '100%', label: 'Bonded & Insured' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-warm-100 p-6 shadow-sm">
                <p className="font-serif text-3xl font-bold text-sage-600">{s.value}</p>
                <p className="text-sm text-warm-600 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="space-y-8">
            <h2 className="font-serif text-3xl font-bold text-sage-800 text-center">Meet the Team</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map(member => (
                <div key={member.name} className="bg-white rounded-2xl border border-warm-100 p-6 shadow-sm text-center">
                  <div className="w-16 h-16 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {member.name.charAt(0)}
                  </div>
                  <p className="font-bold text-neutral-900">{member.name}</p>
                  <p className="text-xs text-sage-600 font-semibold uppercase tracking-wider mt-0.5 mb-3">{member.role}</p>
                  <p className="text-sm text-warm-600 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-sage-600 rounded-3xl p-10 text-center text-white">
            <h2 className="font-serif text-3xl font-bold mb-3">Ready to meet your sitter?</h2>
            <p className="text-sage-200 mb-6">Book a free meet & greet — no commitment required.</p>
            <Link href="/book">
              <button className="bg-white text-sage-800 font-bold px-8 py-3 rounded-full hover:bg-warm-50 transition-all shadow-sm">
                Book a Free Meet & Greet
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
