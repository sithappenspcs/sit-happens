'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { PawPrint, Plus, Loader2 } from 'lucide-react';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
}

interface PetStepProps {
  selectedPetIds: number[];
  onChange: (petIds: number[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PetStep({ selectedPetIds, onChange, onNext, onBack }: PetStepProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', species: 'Dog', breed: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.pets.getAll()
      .then(setPets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const togglePet = (id: number) => {
    onChange(
      selectedPetIds.includes(id)
        ? selectedPetIds.filter((p) => p !== id)
        : [...selectedPetIds, id]
    );
  };

  const handleAddPet = async () => {
    if (!newPet.name.trim()) return;
    setSaving(true);
    try {
      const created = await api.pets.create({
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed || undefined,
      });
      setPets((prev) => [...prev, created]);
      onChange([...selectedPetIds, created.id]);
      setNewPet({ name: '', species: 'Dog', breed: '' });
      setAdding(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-1">Which pets?</h2>
        <p className="text-warm-600 text-sm">Select all pets that will be part of this booking.</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

      <div className="space-y-2">
        {pets.map((pet) => {
          const selected = selectedPetIds.includes(pet.id);
          return (
            <button
              key={pet.id}
              onClick={() => togglePet(pet.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                selected ? 'border-sage-600 bg-sage-50' : 'border-warm-200 hover:border-sage-300 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                selected ? 'bg-sage-600 text-white' : 'bg-warm-100 text-warm-700'
              }`}>
                {pet.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${selected ? 'text-sage-900' : 'text-warm-900'}`}>{pet.name}</p>
                <p className="text-xs text-warm-500">{pet.breed ? `${pet.breed} · ` : ''}{pet.species}</p>
              </div>
              {selected && (
                <div className="w-5 h-5 bg-sage-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}

        {pets.length === 0 && !adding && (
          <div className="text-center py-8 text-warm-500">
            <PawPrint className="w-10 h-10 mx-auto mb-2 text-warm-300" />
            <p className="text-sm font-medium">No pets registered yet.</p>
          </div>
        )}
      </div>

      {adding ? (
        <div className="bg-warm-50 border border-warm-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-warm-900 text-sm">Add a new pet</h3>
          <input
            type="text"
            placeholder="Pet name"
            value={newPet.name}
            onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newPet.species}
              onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
              className="px-3 py-2 rounded-xl border border-warm-200 text-sm focus:border-sage-400 outline-none bg-white"
            >
              {['Dog', 'Cat', 'Bird', 'Small Animal', 'Other'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Breed (optional)"
              value={newPet.breed}
              onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
              className="px-3 py-2 rounded-xl border border-warm-200 text-sm focus:border-sage-400 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleAddPet} className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Pet'}
            </Button>
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-semibold"
        >
          <Plus className="w-4 h-4" /> Add a pet
        </button>
      )}

      <div className="pt-4 flex justify-between border-t border-warm-100">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="primary" onClick={onNext} disabled={selectedPetIds.length === 0}>
          Continue to Summary
        </Button>
      </div>
    </div>
  );
}
