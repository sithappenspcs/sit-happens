import { Button } from "@/components/ui/Button";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-2">Payment Details</h2>
        <p className="text-warm-600">Securely confirm your booking. A hold will be placed on your card, but you won't be charged until the booking is approved.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-warm-200 shadow-sm">
        <div className="h-48 flex items-center justify-center bg-warm-50 rounded-xl border border-warm-200 border-dashed text-warm-500 flex-col gap-2">
          <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Stripe Payment Elements Placeholder
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-warm-100 mt-8">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button variant="primary" onClick={onNext} className="px-8">
          Authorize $85.00
        </Button>
      </div>
    </div>
  );
}
