'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddressStep } from './AddressStep';
import { ServiceStep } from './ServiceStep';
import { DateTimeStep } from './DateTimeStep';
import { PetStep } from './PetStep';
import { SummaryStep } from './SummaryStep';
import { PaymentStep } from './PaymentStep';
import { api } from '@/lib/api';

type BookingStep = 'address' | 'service' | 'datetime' | 'pet' | 'summary' | 'payment' | 'confirmation';

const steps: { id: BookingStep; label: string }[] = [
  { id: 'address',  label: 'Location' },
  { id: 'service',  label: 'Service'  },
  { id: 'datetime', label: 'Date & Time' },
  { id: 'pet',      label: 'Pets'     },
  { id: 'summary',  label: 'Review'   },
  { id: 'payment',  label: 'Payment'  },
];

interface BookingData {
  address: string;
  lat: number;
  lng: number;
  serviceId: number | null;
  selectedPackage: any | null;
  date: Date | null;
  startTime: string | null;
  endTime: string | null;
  petIds: number[];
}

const DEFAULT_DATA: BookingData = {
  address: '',
  lat: 53.5461,
  lng: -113.4938,
  serviceId: null,
  selectedPackage: null,
  date: null,
  startTime: null,
  endTime: null,
  petIds: [],
};

export default function BookingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>('address');
  const [data, setData] = useState<BookingData>({ ...DEFAULT_DATA });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // clientSecret comes back from POST /bookings and is passed to Stripe Elements
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const visibleSteps = steps;
  const currentIdx = visibleSteps.findIndex(s => s.id === currentStep);
  const next = () => visibleSteps[currentIdx + 1] && setCurrentStep(visibleSteps[currentIdx + 1].id);
  const back = () => visibleSteps[currentIdx - 1] && setCurrentStep(visibleSteps[currentIdx - 1].id);

  // Called from SummaryStep — creates the booking and moves to payment
  const handleCreateBooking = async () => {
    if (!data.serviceId || !data.startTime || !data.endTime || data.petIds.length === 0) {
      setSubmitError('Please complete all steps before submitting.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await api.bookings.create({
        packageId: data.serviceId,
        startTime: data.startTime,
        endTime: data.endTime,
        petIds: data.petIds,
        clientNotes: data.address ? `Service at: ${data.address}` : undefined,
      });
      // result = { booking, clientSecret }
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setCurrentStep('payment');
      } else {
        // No Stripe key configured — go straight to confirmation
        setCurrentStep('confirmation');
      }
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepStatus = (idx: number) => {
    if (idx < currentIdx) return 'complete';
    if (idx === currentIdx) return 'current';
    return 'upcoming';
  };

  if (currentStep === 'confirmation') {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-warm-100 p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif text-sage-900">Booking Requested!</h2>
        <p className="text-warm-600 max-w-md mx-auto text-sm">
          Your booking has been submitted. Once a sitter is assigned and payment is authorised, you'll receive a confirmation email.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            View My Bookings
          </Button>
          <Button variant="outline" onClick={() => {
            setCurrentStep('address');
            setData({ ...DEFAULT_DATA });
            setClientSecret(null);
          }}>
            Book Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-warm-100 overflow-hidden">
      {/* Progress bar */}
      <div className="bg-warm-50/50 border-b border-warm-100 p-6">
        <ol className="flex items-center justify-between">
          {visibleSteps.map((step, idx) => {
            const status = stepStatus(idx);
            return (
              <li key={step.id} className="relative flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    status === 'complete' ? 'bg-sage-600 border-sage-600 text-white'
                    : status === 'current' ? 'border-sage-600 text-sage-600 font-semibold bg-white'
                    : 'border-warm-200 text-warm-400 bg-white'
                  }`}>
                    {status === 'complete'
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <span className="text-sm">{idx + 1}</span>}
                  </div>
                  <span className={`mt-1.5 text-xs font-medium hidden md:block ${status === 'current' ? 'text-sage-800' : 'text-warm-400'}`}>
                    {step.label}
                  </span>
                </div>
                {idx !== visibleSteps.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 -mt-px ${status === 'complete' ? 'bg-sage-600' : 'bg-warm-200'}`} />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Step content */}
      <div className="p-8 min-h-[420px]">
        {currentStep === 'address' && (
          <AddressStep
            address={data.address}
            onChange={(val, lat, lng) => setData(d => ({ ...d, address: val, ...(lat && lng ? { lat, lng } : {}) }))}
            onNext={next}
          />
        )}
        {currentStep === 'service' && (
          <ServiceStep
            selectedServiceId={data.serviceId}
            onChange={(id, pkg) => setData(d => ({ ...d, serviceId: id, selectedPackage: pkg }))}
            onNext={next}
            onBack={back}
          />
        )}
        {currentStep === 'datetime' && (
          <DateTimeStep
            date={data.date}
            startTime={data.startTime}
            packageId={data.serviceId}
            lat={data.lat}
            lng={data.lng}
            onChange={(date, start, end) => setData(d => ({ ...d, date, startTime: start, endTime: end }))}
            onNext={next}
            onBack={back}
          />
        )}
        {currentStep === 'pet' && (
          <PetStep
            selectedPetIds={data.petIds}
            onChange={ids => setData(d => ({ ...d, petIds: ids }))}
            onNext={next}
            onBack={back}
          />
        )}
        {currentStep === 'summary' && (
          <SummaryStep
            bookingData={data}
            onBack={back}
            onSubmit={handleCreateBooking}
            submitting={submitting}
            error={submitError}
          />
        )}
        {currentStep === 'payment' && (
          <PaymentStep
            clientSecret={clientSecret}
            amount={data.selectedPackage ? Number(data.selectedPackage.basePrice) : 0}
            onBack={() => {
              // Going back from payment = booking already created.
              // Just go to confirmation — the booking exists in DB.
              setCurrentStep('confirmation');
            }}
            onSuccess={() => setCurrentStep('confirmation')}
          />
        )}
      </div>
    </div>
  );
}
