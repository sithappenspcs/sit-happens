import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PetStepProps {
  selectedPetIds: number[];
  onChange: (petIds: number[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// Scaffolded data - would come from /api/pets
const MOCK_PETS = [
  { id: 1, name: "Bella", species: "Dog", breed: "Golden Retriever" },
  { id: 2, name: "Charlie", species: "Dog", breed: "French Bulldog" },
  { id: 3, name: "Luna", species: "Cat", breed: "Domestic Shorthair" },
];

export function PetStep({ selectedPetIds, onChange, onNext, onBack }: PetStepProps) {
  const togglePet = (id: number) => {
    if (selectedPetIds.includes(id)) {
      onChange(selectedPetIds.filter((p) => p !== id));
    } else {
      onChange([...selectedPetIds, id]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-sage-900 mb-2">Who is this for?</h2>
          <p className="text-warm-600">Select the pets that will be receiving the service.</p>
        </div>
        <Button variant="outline" className="text-sm py-2">
          + Add New Pet
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {MOCK_PETS.map((pet) => {
          const isSelected = selectedPetIds.includes(pet.id);
          return (
            <button
              key={pet.id}
              onClick={() => togglePet(pet.id)}
              className={`text-left p-4 rounded-xl border-2 flex items-center gap-4 transition-all
                ${isSelected 
                  ? "border-sage-600 bg-sage-50 ring-1 ring-sage-600/30" 
                  : "border-warm-200 bg-white hover:border-sage-300 hover:bg-warm-50"
                }`}
            >
              <div className="w-12 h-12 rounded-full bg-warm-200 flex items-center justify-center shrink-0">
                <span className="text-xl">
                  {pet.species === "Dog" ? "🐶" : "🐱"}
                </span>
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${isSelected ? "text-sage-900" : "text-warm-900"}`}>{pet.name}</h4>
                <p className="text-xs text-warm-500">{pet.breed}</p>
              </div>
              
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${isSelected ? "border-sage-600 bg-sage-600" : "border-warm-300 bg-white"}`}
              >
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-warm-100 mt-8">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={selectedPetIds.length === 0} className="px-8">
          Continue to Summary
        </Button>
      </div>
    </div>
  );
}
