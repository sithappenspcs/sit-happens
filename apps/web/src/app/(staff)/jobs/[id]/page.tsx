'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Navigation, CheckCircle, Camera, PawPrint, Info, Key, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [visitNote, setVisitNote] = useState('');

  useEffect(() => {
    api.staff.getJobDetails(params.id)
      .then(setJob)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setActionLoading(true);
    try {
      if (action === 'check-in') {
        await api.staff.checkIn(params.id, { photoUrls: [], note: 'Checked in via portal' });
      } else {
        if (!visitNote) throw new Error('Please provide a visit note before checking out.');
        await api.staff.checkOut(params.id, { photoUrls: [], note: visitNote });
      }
      // Refresh data
      const updatedJob = await api.staff.getJobDetails(params.id);
      setJob(updatedJob);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-sage-600 animate-spin mb-4" />
      <p className="text-neutral-500 font-medium">Fetching job details...</p>
    </div>
  );

  if (error || !job) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mt-8">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-red-900">Job not found</h2>
      <p className="text-red-700 mt-2">{error || "The job you are looking for doesn't exist or you don't have access."}</p>
      <Link href="/staff" className="mt-6 inline-block px-6 py-2 bg-red-600 text-white rounded-xl font-medium">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Navigation */}
      <Link href="/staff" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex space-x-2 mb-3">
                {job.status === 'completed' && <span className="bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Completed</span>}
                {job.status === 'active' && <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider animate-pulse flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>In Progress</span>}
                {job.status === 'approved' && <span className="bg-sage-100 text-sage-800 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Upcoming</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-neutral-900">{job.package.name}</h1>
              <p className="text-neutral-600 mt-2 text-lg">{job.client.user.name}</p>
            </div>
            
            <div className="text-left sm:text-right">
              <p className="text-neutral-900 font-bold text-lg">{new Date(job.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-neutral-500">{new Date(job.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 border-t border-neutral-100 p-6 sm:px-8 sm:py-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-neutral-400 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-neutral-700 font-medium">{job.client.address}</p>
          </div>
          <button className="whitespace-nowrap inline-flex justify-center items-center px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm">
            <Navigation className="w-4 h-4 mr-2 text-sage-600" />
            Get Directions
          </button>
        </div>
      </div>

      {/* Status Action Cards */}
      {job.status === 'approved' && (
        <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6 sm:p-8 text-center mb-8 shadow-sm">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MapPin className="w-8 h-8 text-sage-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Arrived at the location?</h2>
          <p className="text-sage-800 mb-6 max-w-md mx-auto">Check in to let the client know their pets are in good hands.</p>
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('check-in')}
            className="w-full sm:w-auto px-8 py-3.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Check In Now'}
          </button>
        </div>
      )}

      {job.status === 'active' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 text-amber-500 mr-2" />
            Complete Visit & Check Out
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Visit Note (Required)</label>
              <textarea 
                value={visitNote}
                onChange={(e) => setVisitNote(e.target.value)}
                placeholder="How did the visit go? Did they eat/potty? Any issues?"
                className="w-full border-neutral-300 rounded-xl p-4 min-h-[120px] focus:ring-amber-500 focus:border-amber-500 resize-none shadow-sm"
              />
            </div>

            <button 
              disabled={actionLoading}
              onClick={() => handleAction('check-out')}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Finish & Check Out'}
            </button>
          </div>
        </div>
      )}

      {/* Job Instructions */}
      <div className="space-y-6">
        <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex items-center">
            <Key className="w-5 h-5 text-neutral-500 mr-3" />
            <h3 className="font-bold text-neutral-900">Access Instructions</h3>
          </div>
          <div className="p-6 text-neutral-700 bg-yellow-50/30">
            <p>{job.homeAccessInstructions || "No special instructions provided."}</p>
          </div>
        </section>

        {/* Pet Profiles */}
        <section>
          <h3 className="text-lg font-playfair font-bold text-neutral-900 mb-4 flex items-center">
            <PawPrint className="w-5 h-5 text-sage-600 mr-2" />
            Pets on this booking
          </h3>
          
          <div className="space-y-4">
            {job.bookedPets.map((pet: any) => (
              <div key={pet.id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center border-2 border-sage-100">
                    <PawPrint className="w-8 h-8 text-neutral-300" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900">{pet.name}</h4>
                    <p className="text-sm text-neutral-500">{pet.breed} • {pet.species}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Feeding</p>
                    <p className="text-sm text-neutral-800">{pet.feedingInstructions || "None"}</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Behavior</p>
                    <p className="text-sm text-neutral-800">{pet.behavioralNotes || "None"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
    </div>
  );
}
