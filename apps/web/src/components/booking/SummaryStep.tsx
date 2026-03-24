import { Button } from "@/components/ui/Button";

interface SummaryStepProps {
  bookingData: any;
  onNext: () => void;
  onBack: () => void;
}

export function SummaryStep({ bookingData, onNext, onBack }: SummaryStepProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-2">Review Your Booking</h2>
        <p className="text-warm-600">Please confirm your service details before proceeding to payment.</p>
      </div>

      <div className="bg-warm-50 rounded-2xl p-6 border border-warm-200 space-y-4">
        <div className="flex justify-between border-b border-warm-200 pb-4">
          <div>
            <span className="text-sm font-semibold text-warm-500 uppercase tracking-wider">Service</span>
            <p className="text-lg font-bold text-sage-900">House Sitting</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-warm-500 uppercase tracking-wider">Base Price</span>
            <p className="text-lg font-medium text-warm-900">$85.00</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-warm-200 pb-4">
          <div>
            <span className="text-sm font-semibold text-warm-500 uppercase tracking-wider">Date & Time</span>
            <p className="text-warm-900 font-medium">Sat, Mar 28 • 08:00 AM</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-warm-500 uppercase tracking-wider">Location</span>
            <p className="text-warm-900 font-medium truncate">{bookingData.address || "123 Main St"}</p>
          </div>
        </div>

        <div className="border-b border-warm-200 pb-4">
          <span className="text-sm font-semibold text-warm-500 uppercase tracking-wider">Pets Included</span>
          <p className="text-warm-900 font-medium">{bookingData.petIds.length > 0 ? `${bookingData.petIds.length} Pets Selected` : "Bella (Golden Retriever)"}</p>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-sage-900">Total</span>
          <span className="text-2xl font-bold text-sage-700">$85.00</span>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-warm-100 mt-8">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button variant="primary" onClick={onNext} className="px-8">
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
