import BookingWizard from "@/components/booking/BookingWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Service | Sit Happens",
};

export default function ClientBookingPage() {
  return (
    <div className="min-h-screen bg-warm-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pl-2">
          <h1 className="text-3xl font-serif font-bold text-sage-900">Book a Service</h1>
          <p className="mt-2 text-warm-600">Complete the steps below to schedule a visit for your pet.</p>
        </div>
        
        <BookingWizard />
      </div>
    </div>
  );
}
