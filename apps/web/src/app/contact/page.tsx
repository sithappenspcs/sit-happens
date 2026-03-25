'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Loader2, MapPin, Phone, Mail } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) setForm({ name: '', email: '', message: '' });
    } catch {
      setResult({ success: false, message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed w-full flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md z-50 border-b border-warm-100">
        <Link href="/" className="font-serif text-2xl font-bold text-sage-800">Sit Happens.</Link>
        <nav className="hidden md:flex gap-8 text-warm-800 font-medium text-sm">
          <Link href="/services" className="hover:text-sage-600 transition-colors">Services</Link>
          <Link href="/about" className="hover:text-sage-600 transition-colors">About Us</Link>
          <Link href="/faq" className="hover:text-sage-600 transition-colors">FAQ</Link>
          <Link href="/contact" className="text-sage-600 font-semibold">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-warm-700 hover:text-sage-600 hidden sm:block">Sign In</Link>
          <Link href="/book"><Button variant="primary">Book Now</Button></Link>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-4xl font-bold text-sage-800">Get in Touch</h1>
              <p className="text-warm-700 mt-3 leading-relaxed">
                Have questions about our services or want to check availability in your area? Send us a message and we'll reply within 24 hours.
              </p>
            </div>

            {result?.success ? (
              <div className="bg-sage-50 border border-sage-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-sage-600 mx-auto mb-4" />
                <p className="font-bold text-sage-900 text-lg">Message Sent!</p>
                <p className="text-sage-700 mt-2 text-sm">{result.message}</p>
                <button onClick={() => setResult(null)}
                  className="mt-4 text-sm text-sage-600 font-semibold hover:text-sage-700 underline underline-offset-4">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-warm-800 mb-1.5">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-800 mb-1.5">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-800 mb-1.5">Message</label>
                  <textarea rows={5} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about your pets and what kind of care you're looking for..."
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all resize-none text-sm" />
                </div>
                {result && !result.success && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{result.message}</div>
                )}
                <Button variant="primary" type="submit" className="w-full" disabled={loading}>
                  {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Sending...</span> : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Info panel */}
          <div className="space-y-6">
            <div className="bg-warm-50 rounded-2xl border border-warm-100 p-8 space-y-6">
              <h2 className="font-serif text-xl font-bold text-sage-800">Contact Information</h2>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: 'Service Area', value: 'Edmonton & surrounding area, AB' },
                  { icon: Mail,   label: 'Email',        value: 'hello@sithappens.ca' },
                  { icon: Phone,  label: 'Phone',        value: '(780) 555-0100' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white border border-warm-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-sage-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-warm-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-warm-800 font-medium mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-sage-50 rounded-2xl border border-sage-100 p-6">
              <p className="font-bold text-sage-900 mb-2">Hours of Operation</p>
              <div className="space-y-1.5 text-sm text-sage-700">
                <div className="flex justify-between"><span>Monday – Friday</span><span className="font-semibold">7am – 8pm</span></div>
                <div className="flex justify-between"><span>Saturday</span><span className="font-semibold">8am – 6pm</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="font-semibold">9am – 5pm</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-warm-200 p-6 text-center">
              <p className="text-warm-700 text-sm mb-4">Ready to book? Get started online.</p>
              <Link href="/book">
                <Button variant="primary" className="w-full">Check Availability</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
