import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { format, addDays, isSameDay } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";

interface DateTimeStepProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onChange: (date: Date, time: string) => void;
  onNext: () => void;
  onBack: () => void;
  serviceId: number | null;
}

export function DateTimeStep({ selectedDate, selectedTime, onChange, onNext, onBack, serviceId }: DateTimeStepProps) {
  // Scaffold: Mock dates for the next 7 days
  const upcomingDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i + 1));
  
  // Scaffold: Mock available slots
  const mockSlots = ["08:00 AM", "10:30 AM", "01:00 PM", "04:30 PM", "06:00 PM"];

  const [tempDate, setTempDate] = useState<Date | null>(selectedDate);
  const [tempTime, setTempTime] = useState<string | null>(selectedTime);

  const handleDateSelect = (date: Date) => {
    setTempDate(date);
    setTempTime(null); // Reset time when date changes
  };

  const handleNext = () => {
    if (tempDate && tempTime) {
      onChange(tempDate, tempTime);
      onNext();
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-2">When do you need us?</h2>
        <p className="text-warm-600">Select a date to see precise, real-time availability in your zone.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-sage-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Select Date
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {upcomingDays.map((date, i) => {
              const isSelected = tempDate ? isSameDay(tempDate, date) : false;
              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(date)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all
                    ${isSelected 
                      ? "bg-sage-600 border-sage-600 text-white shadow-md" 
                      : "bg-white border-warm-200 text-warm-700 hover:border-sage-300 hover:bg-sage-50"
                    }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    {format(date, "EEE")}
                  </span>
                  <span className="text-xl font-bold mt-1">{format(date, "d")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-sage-800 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" /> Select Time
          </h3>
          
          {!tempDate ? (
            <div className="h-full min-h-[120px] flex items-center justify-center bg-warm-50 border border-warm-100 border-dashed rounded-xl text-warm-500 p-4 text-center">
              Please select a date first to view available times.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {mockSlots.map((slot) => {
                const isSelected = tempTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setTempTime(slot)}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all
                      ${isSelected
                        ? "bg-sage-100 border-sage-600 text-sage-800 ring-1 ring-sage-600"
                        : "bg-white border-warm-200 text-warm-700 hover:border-sage-400"
                      }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-warm-100 mt-8">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button 
          variant="primary" 
          onClick={handleNext} 
          disabled={!tempDate || !tempTime} 
          className="px-8"
        >
          Continue to Pet Details
        </Button>
      </div>
    </div>
  );
}
