'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'Do you offer a meet and greet?', a: 'Yes — all new clients receive a complimentary in-home meet and greet before the first booking. This lets your pet get comfortable with their sitter and gives us a chance to learn your pet\'s routine.' },
      { q: 'How do I create an account?', a: 'Click "Book Now" or "Sign In" at the top of the page and select "Create Account". You\'ll be able to add your pets, address, and book services within minutes.' },
      { q: 'What areas do you serve?', a: 'We currently serve Edmonton and the surrounding area including Sherwood Park and St. Albert. Enter your address during booking and we\'ll confirm coverage instantly.' },
    ],
  },
  {
    category: 'Bookings & Scheduling',
    items: [
      { q: 'How do I book a service?', a: 'Log in, click "Book a Service", and follow the 6-step wizard: location → service → date/time → pets → review → payment. Bookings are reviewed and approved by our team within a few hours.' },
      { q: 'How far in advance should I book?', a: 'We recommend booking at least 48 hours in advance. For holiday periods (Christmas, Thanksgiving, long weekends) we recommend 2–3 weeks ahead as demand is very high.' },
      { q: 'Can I request a specific sitter?', a: 'Yes. If you\'ve worked with a sitter before, you can note a preference in the booking notes. We\'ll do our best to accommodate, subject to availability.' },
    ],
  },
  {
    category: 'Safety & Trust',
    items: [
      { q: 'Are your sitters background checked?', a: 'Every sitter on our platform undergoes a criminal background check, reference verification, and completes our in-house training before their first booking.' },
      { q: 'Are you bonded and insured?', a: 'Yes. We carry comprehensive liability insurance and all sitters are bonded. In the unlikely event of an incident, you are fully covered.' },
      { q: 'What happens during a visit?', a: 'Your sitter checks in via the app when they arrive, sends photo updates throughout, and checks out with a detailed visit report covering food, bathroom, activity, and any notes.' },
    ],
  },
  {
    category: 'Billing & Cancellations',
    items: [
      { q: 'When am I charged?', a: 'A pre-authorisation hold is placed on your card when you book. The actual charge is captured only after your booking is confirmed and the service has been completed.' },
      { q: 'What is your cancellation policy?', a: 'Cancellations made more than 24 hours before the start time receive a full refund. Cancellations within 24 hours may be subject to a 50% fee to compensate the sitter for reserved time.' },
      { q: 'Do you charge extra for multiple pets?', a: 'Our pricing includes up to the maximum pets specified per service. Additional pets beyond the limit may incur an add-on fee which is shown transparently at booking.' },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-warm-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-semibold text-neutral-900 text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-warm-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-warm-700 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-warm-50">
      <header className="fixed w-full flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md z-50 border-b border-warm-100">
        <Link href="/" className="font-serif text-2xl font-bold text-sage-800">Sit Happens.</Link>
        <nav className="hidden md:flex gap-8 text-warm-800 font-medium text-sm">
          <Link href="/services" className="hover:text-sage-600 transition-colors">Services</Link>
          <Link href="/about" className="hover:text-sage-600 transition-colors">About Us</Link>
          <Link href="/faq" className="text-sage-600 font-semibold">FAQ</Link>
          <Link href="/contact" className="hover:text-sage-600 transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-warm-700 hover:text-sage-600 hidden sm:block">Sign In</Link>
          <Link href="/book"><Button variant="primary">Book Now</Button></Link>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="font-serif text-5xl font-bold text-sage-800">FAQ</h1>
            <p className="text-warm-600 mt-3">Everything you need to know about Sit Happens.</p>
          </div>

          {faqs.map(section => (
            <div key={section.category} className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
              <div className="bg-warm-50 px-6 py-4 border-b border-warm-100">
                <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">{section.category}</h2>
              </div>
              <div className="px-6 divide-y divide-warm-50">
                {section.items.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
              </div>
            </div>
          ))}

          <div className="bg-sage-600 rounded-2xl p-8 text-center text-white">
            <p className="font-bold text-lg mb-2">Still have questions?</p>
            <p className="text-sage-200 text-sm mb-6">Our team replies within 24 hours.</p>
            <Link href="/contact">
              <button className="bg-white text-sage-800 font-bold px-6 py-2.5 rounded-full hover:bg-warm-50 transition-all text-sm">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
