export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6 md:pt-36">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <h1 className="font-serif text-5xl font-bold text-sage-800">About Sit Happens</h1>
        <p className="text-xl text-warm-700 leading-relaxed">
          Founded in 2026, Sit Happens was born from a simple idea: pet care should be reliable, professional, and transparent. We're a team of bonded, insured, and deeply passionate pet lovers serving the Edmonton area.
        </p>
        <div className="bg-warm-50 p-8 rounded-2xl border border-warm-100 mt-12 shadow-sm">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-lg text-warm-800 leading-relaxed">
            To provide peace of mind to pet parents through real-time communication, constraint-based scheduling, and unparalleled care.
          </p>
        </div>
      </div>
    </main>
  );
}
