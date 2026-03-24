"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

import { AddressStep } from "./AddressStep";
import { ServiceStep } from "./ServiceStep";
import { DateTimeStep } from "./DateTimeStep";
import { PetStep } from "./PetStep";
import { SummaryStep } from "./SummaryStep";
import { PaymentStep } from "./PaymentStep";

type BookingStep = "address" | "service" | "datetime" | "pet" | "summary" | "payment" | "confirmation";

const steps: { id: BookingStep; label: string }[] = [
  { id: "address", label: "Location" },
  { id: "service", label: "Service" },
  { id: "datetime", label: "Date & Time" },
  { id: "pet", label: "Pet Details" },
  { id: "summary", label: "Summary" },
  { id: "payment", label: "Payment" },
];

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("address");
  const [bookingData, setBookingData] = useState({
    address: "",
    serviceId: null as number | null,
    date: null as Date | null,
    startTime: null as string | null,
    petIds: [] as number[],
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return "complete";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-warm-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-warm-50/50 border-b border-warm-100 p-6">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between">
            {steps.map((step, stepIdx) => {
              const status = getStepStatus(stepIdx);
              return (
                <li key={step.id} className="relative flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1 z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                        ${
                          status === "complete"
                            ? "bg-sage-600 border-sage-600 text-white"
                            : status === "current"
                            ? "border-sage-600 text-sage-600 font-semibold bg-white"
                            : "border-warm-200 text-warm-400 bg-white"
                        }`}
                    >
                      {status === "complete" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{stepIdx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium hidden md:block
                        ${status === "current" ? "text-sage-800" : "text-warm-500"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-0.5 -mt-px
                        ${status === "complete" ? "bg-sage-600" : "bg-warm-200"}`}
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="p-8 min-h-[400px]">
        {currentStep === "address" && (
          <AddressStep
            address={bookingData.address}
            onChange={(val) => setBookingData({ ...bookingData, address: val })}
            onNext={nextStep}
          />
        )}

        {currentStep === "service" && (
          <ServiceStep
            selectedServiceId={bookingData.serviceId}
            onChange={(val) => setBookingData({ ...bookingData, serviceId: val })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === "pet" && (
          <PetStep
            selectedPetIds={bookingData.petIds}
            onChange={(val) => setBookingData({ ...bookingData, petIds: val })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === "summary" && (
          <SummaryStep
            bookingData={bookingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === "payment" && (
          <PaymentStep
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === "confirmation" && (
          <div className="animate-fade-in text-center space-y-6 py-12">
            <div className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif text-sage-900 mb-2">Booking Requested!</h2>
            <p className="text-warm-600 max-w-md mx-auto">
              Your booking request has been securely submitted. A temporary hold has been placed on your card. We will notify you once your booking is approved.
            </p>
            <div className="pt-8">
              <Button variant="primary" className="px-8">Go to Dashboard</Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Controls */}
      {currentStep !== "address" && currentStep !== "service" && currentStep !== "datetime" && currentStep !== "pet" && currentStep !== "summary" && currentStep !== "payment" && currentStep !== "confirmation" && (
        <div className="border-t border-warm-100 p-6 bg-warm-50 flex items-center gap-4">
          <Button variant="outline" onClick={prevStep} className="px-8">
            Back
          </Button>
          <div className="flex-1" />
          <Button variant="primary" onClick={nextStep} className="px-8">
            {currentStep === "payment" ? "Pay & Book" : "Next Step"}
          </Button>
        </div>
      )}
    </div>
  );
}
