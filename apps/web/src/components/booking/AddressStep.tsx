import { Button } from "@/components/ui/Button";

interface AddressStepProps {
  address: string;
  onChange: (address: string) => void;
  onNext: () => void;
}

export function AddressStep({ address, onChange, onNext }: AddressStepProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-2">Where will the service take place?</h2>
        <p className="text-warm-600">Please provide the address to check if it's within our service zones.</p>
      </div>
      
      <div className="space-y-4">
        <label className="block">
          <span className="text-warm-700 font-medium mb-1 block">Street Address</span>
          <input
            type="text"
            className="w-full h-12 px-4 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-shadow"
            placeholder="123 Main St, Edmonton, AB"
            value={address}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        
        {/* Placeholder for map or zone validation messages */}
        {address.length > 5 && (
          <div className="p-4 bg-sage-50 text-sage-800 rounded-lg text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>Great! This address is within our primary service zone. No travel surcharge applies.</p>
          </div>
        )}

        <label className="block pt-4">
          <span className="text-warm-700 font-medium mb-1 block">Home Access Instructions</span>
          <textarea
            className="w-full h-24 p-4 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-shadow resize-none"
            placeholder="e.g. Key code is 1234, please lock the bottom lock when leaving."
          />
        </label>
      </div>

      <div className="pt-4 flex justify-end">
        <Button variant="primary" onClick={onNext} disabled={address.length < 5} className="px-8 flex items-center gap-2">
          Continue to Service Selection
        </Button>
      </div>
    </div>
  );
}
