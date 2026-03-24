'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, AlertTriangle, ArrowRight, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function StaffDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.staff.getDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-sage-600 animate-spin mb-4" />
      <p className="text-neutral-500 font-medium">Loading your schedule...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-red-900">Failed to load dashboard</h2>
      <p className="text-red-700 mt-2">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-medium">Retry</button>
    </div>
  );

  const { todayJobs, earningsThisMonth } = data;
  const activeJob = todayJobs.find((j: any) => j.status === 'active');
  const remainingJobs = todayJobs.filter((j: any) => j.status !== 'completed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Quick Stats */}
      <div>
        <h1 className="text-3xl font-playfair font-bold text-neutral-900">Staff Dashboard</h1>
        <p className="text-neutral-500 mt-1">You have {remainingJobs} visits remaining today.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
              <CheckCircle className="w-16 h-16 text-sage-600" />
            </div>
            <p className="text-sm font-medium text-neutral-500">Completed Today</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">{todayJobs.filter((j: any) => j.status === 'completed').length} / {todayJobs.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
              <Clock className="w-16 h-16 text-amber-500" />
            </div>
            <p className="text-sm font-medium text-neutral-500">Next Visit</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">
              {todayJobs.find((j: any) => j.status === 'approved')?.startTime ? 
                new Date(todayJobs.find((j: any) => j.status === 'approved').startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : '--:--'}
            </p>
          </div>

          <div className="bg-sage-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
              <DollarSign className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-sage-100">Month Earnings</p>
            <p className="text-3xl font-bold mt-1">${earningsThisMonth.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Active Job Alert */}
      {activeJob && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden ring-2 ring-amber-500 ring-offset-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 p-3 rounded-full hidden sm:block">
                <AlertTriangle className="w-6 h-6 text-amber-600 animate-pulse" />
              </div>
              <div>
                <span className="px-2.5 py-1 bg-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-lg">Active Job</span>
                <h3 className="text-xl font-bold text-neutral-900 mt-2">{activeJob.package.name}</h3>
                <p className="text-neutral-600 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1.5 text-neutral-400" />
                  {activeJob.client.address}
                </p>
              </div>
            </div>
            <Link 
              href={`/staff/jobs/${activeJob.id}`}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center"
            >
              Job Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )}

      {/* Today's Schedule Timeline */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Today's Schedule</h2>
        </div>
        
        <div className="divide-y divide-neutral-100">
          {todayJobs.map((job: any) => (
            <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center hover:bg-neutral-50 transition-colors group">
              <div className="sm:w-32 flex-shrink-0 mb-4 sm:mb-0">
                <p className="text-sm font-bold text-neutral-900">{new Date(job.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-neutral-900">{job.package.name}</h3>
                  {job.status === 'completed' && <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-xs font-medium">Completed</span>}
                  {job.status === 'active' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium animate-pulse">In Progress</span>}
                </div>
                <p className="text-sm text-neutral-600 mt-1">{job.client.name}</p>
              </div>

              <div className="mt-4 sm:mt-0 flex-shrink-0">
                <Link 
                  href={`/staff/jobs/${job.id}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-neutral-200 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 hover:text-sage-600 transition-colors"
                >
                  View Job
                </Link>
              </div>
            </div>
          ))}
          
          {todayJobs.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              <CheckCircle className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
              <p>No jobs scheduled for today.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
