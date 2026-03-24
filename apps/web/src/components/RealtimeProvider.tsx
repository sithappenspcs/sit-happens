'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell, AlertCircle } from 'lucide-react';

interface NotificationData {
  id: number;
  type: string;
  subject: string;
  body: string;
}

interface ConstraintEvent {
  bookingId: number;
  message?: string;
  elapsedMinutes?: number;
  limit?: number;
}

interface RealtimeContextType {
  socket: Socket | null;
  notifications: NotificationData[];
}

const RealtimeContext = createContext<RealtimeContextType>({ socket: null, notifications: [] });

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [toast, setToast] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'error' } | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time gateway');
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (userId) {
        newSocket.emit('join_room', `user:${userId}`);
      }
    });

    newSocket.on('notification:new', (notif: NotificationData) => {
      setNotifications(prev => [notif, ...prev]);
      showToast(notif.body, 'info');
    });

    newSocket.on('constraint:warning', (data: ConstraintEvent) => {
        showToast(`WARNING: ${data.message || 'Constraint threshold reached.'}`, 'warning');
    });

    newSocket.on('constraint:breach', (data: ConstraintEvent) => {
        showToast(`BREACH: ${data.message || 'Absence limit exceeded!'}`, 'error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const showToast = (message: string, type: 'info' | 'warning' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  return (
    <RealtimeContext.Provider value={{ socket, notifications }}>
      {children}
      
      {/* Real-time Toast Notification Overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={`flex items-center space-x-4 p-4 rounded-2xl shadow-2xl border-2 min-w-[320px] max-w-md ${
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : 
            toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : 
            'bg-white border-sage-100 text-neutral-900'
          }`}>
            <div className={`p-2 rounded-full ${
                toast.type === 'error' ? 'bg-red-100 text-red-600' :
                toast.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                'bg-sage-100 text-sage-600'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{toast.type.toUpperCase()}</p>
              <p className="text-sm font-medium opacity-90">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-neutral-400 hover:text-neutral-600">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </RealtimeContext.Provider>
  );
};
