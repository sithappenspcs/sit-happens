import { Button } from "../../components/ui/Button";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6 md:pt-36">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 animate-fade-in-up">
        <div className="space-y-8">
          <h1 className="font-serif text-5xl font-bold text-sage-800">Contact Us</h1>
          <p className="text-xl text-warm-700">
            Have questions? We're here to help. Send us a message and we'll reply within 24 hours.
          </p>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warm-800 mb-2">Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-500" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-800 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-500" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-800 mb-2">Message</label>
              <textarea rows={5} className="w-full px-4 py-3 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-500" placeholder="How can we help?"></textarea>
            </div>
            <Button variant="primary" type="button" className="w-full">Send Message</Button>
          </form>
        </div>
        <div className="bg-warm-50 rounded-2xl p-8 border border-warm-100 flex flex-col items-center justify-center text-center">
          <p className="font-serif text-2xl text-sage-800 font-bold mb-4">Our Service Area</p>
          <div className="w-full h-64 bg-sage-200 rounded-xl flex items-center justify-center text-sage-600 font-medium">
            [Mapbox Map Placeholder]
          </div>
        </div>
      </div>
    </main>
  );
}
