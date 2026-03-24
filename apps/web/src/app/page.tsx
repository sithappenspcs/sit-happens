import { Button } from "../components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed w-full flex justify-between items-center p-6 bg-white/80 backdrop-blur-md z-50 border-b border-warm-100">
        <div className="font-serif text-2xl font-bold text-sage-800">Sit Happens.</div>
        <nav className="hidden md:flex gap-8 text-warm-800 font-medium">
          <Link href="/services" className="hover:text-sage-600 transition-colors">Services</Link>
          <Link href="/about" className="hover:text-sage-600 transition-colors">About Us</Link>
          <Link href="/faq" className="hover:text-sage-600 transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-sage-600 transition-colors">Contact</Link>
        </nav>
        <Link href="/book">
          <Button variant="primary">Book Now</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sage-50 to-white -z-10" />
        <div className="max-w-4xl space-y-8">
          <h1 className="font-serif text-5xl md:text-7xl font-extrabold text-foreground leading-tight">
            Premium pet care,<br />
            <span className="text-sage-600">tailored to your schedule.</span>
          </h1>
          <p className="text-xl text-warm-700 max-w-2xl mx-auto leading-relaxed">
            Professional, reliable sitters and real-time scheduling. Because your best friend deserves the best care, right in their own home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/book">
              <Button variant="primary" className="text-lg w-full sm:w-auto px-8 py-4">Check Availability</Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" className="text-lg w-full sm:w-auto px-8 py-4">View Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-warm-50 border-y border-warm-100 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around items-center gap-8 text-center text-warm-800">
          <div>
            <div className="text-4xl font-serif font-bold text-sage-600 mb-2">500+</div>
            <div className="font-medium tracking-wide">Happy Pets</div>
          </div>
          <div>
            <div className="text-4xl font-serif font-bold text-sage-600 mb-2">100%</div>
            <div className="font-medium tracking-wide">Bonded & Insured</div>
          </div>
          <div>
            <div className="text-4xl font-serif font-bold text-sage-600 mb-2">GPS</div>
            <div className="font-medium tracking-wide">Tracked Visits</div>
          </div>
        </div>
      </section>

      {/* Basic Footer */}
      <footer className="mt-auto py-12 px-6 bg-warm-900 text-warm-100 text-center">
        <p>© 2026 Sit Happens Pet Care Services. All rights reserved.</p>
      </footer>
    </main>
  );
}
