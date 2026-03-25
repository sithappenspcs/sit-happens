'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PawPrint, Plus, Trash2, Edit2, Loader2, X, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  weightKg: number | null;
  feedingInstructions: string | null;
  behavioralNotes: string | null;
  medicalConditions: string | null;
  vaccinationStatus: string;
}

const SPECIES = ['Dog', 'Cat', 'Bird', 'Small Animal', 'Other'];
const VACCINATION = ['current', 'expired', 'unknown'];

const emptyPet = { name: '', species: 'Dog', breed: '', weightKg: '', feedingInstructions: '', behavioralNotes: '', medicalConditions: '', vaccinationStatus: 'unknown' };

export default function ClientPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<typeof emptyPet>({ ...emptyPet });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    api.pets.getAll()
      .then(setPets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm({ ...emptyPet }); setEditingId(null); setShowForm(true); setFormError(null); };
  const openEdit = (pet: Pet) => {
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      weightKg: pet.weightKg?.toString() || '',
      feedingInstructions: pet.feedingInstructions || '',
      behavioralNotes: pet.behavioralNotes || '',
      medicalConditions: pet.medicalConditions || '',
      vaccinationStatus: pet.vaccinationStatus,
    });
    setEditingId(pet.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Pet name is required.'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        species: form.species,
        breed: form.breed || null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        feedingInstructions: form.feedingInstructions || null,
        behavioralNotes: form.behavioralNotes || null,
        medicalConditions: form.medicalConditions || null,
        vaccinationStatus: form.vaccinationStatus,
      };
      if (editingId) {
        const updated = await api.pets.update(editingId, payload);
        setPets(prev => prev.map(p => p.id === editingId ? updated : p));
      } else {
        const created = await api.pets.create(payload);
        setPets(prev => [...prev, created]);
      }
      setShowForm(false);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove ${name} from your profile? This won't affect existing bookings.`)) return;
    try {
      await api.pets.delete(id);
      setPets(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const vaccinationColor = (v: string) => v === 'current' ? 'text-sage-700 bg-sage-50' : v === 'expired' ? 'text-red-600 bg-red-50' : 'text-neutral-500 bg-neutral-100';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-neutral-900">My Pets</h1>
            <p className="text-neutral-500 text-sm">{pets.length} registered</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Pet
        </button>
      </div>

      {/* Pet form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-sage-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-neutral-900">{editingId ? 'Edit Pet' : 'Add New Pet'}</h2>
            <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none" placeholder="e.g. Biscuit" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Species *</label>
              <select value={form.species} onChange={e => setForm({ ...form, species: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none bg-white">
                {SPECIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Breed</label>
              <input type="text" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none" placeholder="e.g. Golden Retriever" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Weight (kg)</label>
              <input type="number" value={form.weightKg} onChange={e => setForm({ ...form, weightKg: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none" placeholder="e.g. 12.5" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Vaccination Status</label>
              <select value={form.vaccinationStatus} onChange={e => setForm({ ...form, vaccinationStatus: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none bg-white capitalize">
                {VACCINATION.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Feeding Instructions</label>
              <textarea value={form.feedingInstructions} onChange={e => setForm({ ...form, feedingInstructions: e.target.value })}
                rows={2} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none resize-none" placeholder="Feeding schedule, amounts, dietary restrictions..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Behavioral Notes</label>
              <textarea value={form.behavioralNotes} onChange={e => setForm({ ...form, behavioralNotes: e.target.value })}
                rows={2} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none resize-none" placeholder="Temperament, fears, other pets, leash behavior..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wider">Medical Conditions / Medications</label>
              <textarea value={form.medicalConditions} onChange={e => setForm({ ...form, medicalConditions: e.target.value })}
                rows={2} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-sage-400 outline-none resize-none" placeholder="Allergies, medications, conditions the sitter should know about..." />
            </div>
          </div>
          {formError && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-xl p-3">{formError}</p>}
          <div className="flex gap-2 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Add Pet'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pet list */}
      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <PawPrint className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="font-semibold text-neutral-600">No pets registered yet</p>
          <button onClick={openAdd} className="mt-4 text-sm text-sage-600 font-semibold hover:text-sage-700">Add your first pet →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pets.map(pet => (
            <div key={pet.id} className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warm-100 text-warm-700 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {pet.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{pet.name}</p>
                    <p className="text-xs text-neutral-400">{pet.breed ? `${pet.breed} · ` : ''}{pet.species}{pet.weightKg ? ` · ${pet.weightKg}kg` : ''}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${vaccinationColor(pet.vaccinationStatus)}`}>
                  Vaccines: {pet.vaccinationStatus}
                </span>
              </div>
              {(pet.feedingInstructions || pet.behavioralNotes) && (
                <div className="space-y-2 mb-4">
                  {pet.feedingInstructions && (
                    <div className="bg-neutral-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Feeding</p>
                      <p className="text-xs text-neutral-700 line-clamp-2">{pet.feedingInstructions}</p>
                    </div>
                  )}
                  {pet.behavioralNotes && (
                    <div className="bg-neutral-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Behavior</p>
                      <p className="text-xs text-neutral-700 line-clamp-2">{pet.behavioralNotes}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => openEdit(pet)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-neutral-200 text-neutral-600 hover:text-sage-600 hover:border-sage-200 hover:bg-sage-50 rounded-xl text-xs font-semibold transition-all">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(pet.id, pet.name)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl text-xs font-semibold transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
