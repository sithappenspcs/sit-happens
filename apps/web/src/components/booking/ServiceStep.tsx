import { Button } from "@/components/ui/Button";

interface ServiceStepProps {
  selectedServiceId: number | null;
  onChange: (serviceId: number) => void;
  onNext: () => void;
  onBack: () => void;
}

// Scaffolded static data - will be fetching from API in full implementation
const MOCK_SERVICES = [
  { id: 1, name: "Drop-in Visit", duration: "30 mins", price: 25, popular: true },
  { id: 2, name: "House Sitting", duration: "Overnight", price: 85, popular: false },
  { id: 3, name: "Dog Walking", duration: "45 mins", price: 30, popular: false },
];

export function ServiceStep({ selectedServiceId, onChange, onNext, onBack }: ServiceStepProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-2">Select a Service</h2>
        <p className="text-warm-600">Choose the type of care your pet needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_SERVICES.map((pkg) => {
          const isSelected = selectedServiceId === pkg.id;
          return (
            <button
              key={pkg.id}
              onClick={() => onChange(pkg.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 relative
                ${isSelected 
                  ? 'border-sage-600 bg-sage-50 shadow-md ring-2 ring-sage-600/20' 
                  : 'border-warm-200 hover:border-sage-300 hover:bg-warm-50 bg-white'
                }
              `}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Popular
                </span>
              )}
              <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-sage-900' : 'text-warm-900'}`}>{pkg.name}</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-warm-500 text-sm flex items-center gap-1">
                  ⏱️ {pkg.duration}
                </span>
                <span className={`font-medium ${isSelected ? 'text-sage-700' : 'text-warm-700'}`}>${pkg.price}</span>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4 text-sage-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-warm-100 mt-8">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!selectedServiceId} className="px-8">
          Continue to Schedule
        </Button>
      </div>
    </div>
  );
}
