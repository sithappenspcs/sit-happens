import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import Link from "next/link";

const packages = [
  {
    slug: 'standard-drop-in',
    name: 'Standard Drop-In Visit',
    tagline: 'A quick visit for potty breaks and cuddles.',
    description: '30 minute visit including feeding, fresh water, and a short walk or playtime.',
    basePrice: 25.00,
    priceUnit: 'per visit',
    duration: '30 mins',
  },
  {
    slug: 'premium-house-sit',
    name: 'Premium House Sitting',
    tagline: 'Overnight care in your home.',
    description: "The sitter stays overnight and maintains your pet's complete routine.",
    basePrice: 95.00,
    priceUnit: 'per night',
    duration: 'Overnight',
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-warm-50 py-24 px-6 md:pt-36">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-sage-800">Our Services</h1>
          <p className="text-xl text-warm-700 max-w-2xl mx-auto">
            Choose the perfect care package for your pet. All services include GPS tracking and real-time updates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {packages.map((pkg) => (
            <Card key={pkg.slug} className="flex flex-col h-full animate-fade-in-up">
              <div className="bg-sage-100 h-48 w-full flex items-center justify-center text-sage-400 font-medium">
                [Image Placeholder]
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-2xl font-bold text-foreground">{pkg.name}</h3>
                </div>
                <p className="text-sage-600 font-semibold mb-2">{pkg.tagline}</p>
                <p className="text-warm-700 mb-6 flex-grow">{pkg.description}</p>
                <div className="flex items-end justify-between mt-auto pt-6 border-t border-warm-100">
                  <div>
                    <span className="text-3xl font-bold text-sage-700">${pkg.basePrice}</span>
                    <span className="text-warm-600 ml-1">/ {pkg.priceUnit}</span>
                  </div>
                  <Link href={`/book?package=${pkg.slug}`}>
                    <Button variant="outline">Book</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
