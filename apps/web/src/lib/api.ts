const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || response.statusText);
  }

  return response.json();
}

export const api = {
  staff: {
    getDashboard: () => fetchWithAuth('/staff-operations/dashboard'),
    getJobDetails: (id: string | number) => fetchWithAuth(`/staff-operations/jobs/${id}`),
    checkIn: (id: string | number, data: { photoUrls: string[]; note?: string }) => 
      fetchWithAuth(`/staff-operations/check-in`, { method: 'POST', body: JSON.stringify({ bookingId: id, ...data }) }),
    checkOut: (id: string | number, data: { photoUrls: string[]; note?: string }) => 
      fetchWithAuth(`/staff-operations/check-out`, { method: 'POST', body: JSON.stringify({ bookingId: id, ...data }) }),
    setAvailability: (data: { date: string; isAvailable: boolean; notes?: string }) =>
      fetchWithAuth('/staff-operations/availability', { method: 'POST', body: JSON.stringify(data) }),
    reportIncident: (data: { bookingId: number; description: string; severity: string; photoUrls: string[] }) =>
      fetchWithAuth('/staff-operations/incident', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    getBookings: () => fetchWithAuth('/admin/bookings'),
    approveBooking: (id: number) => fetchWithAuth(`/admin/bookings/${id}/approve`, { method: 'POST' }),
    declineBooking: (id: number, reason: string) => fetchWithAuth(`/admin/bookings/${id}/decline`, { method: 'POST', body: JSON.stringify({ reason }) }),
    refundBooking: (id: number) => fetchWithAuth(`/admin/bookings/${id}/refund`, { method: 'POST' }),
    getPayouts: () => fetchWithAuth('/admin/payouts'),
  },
  notifications: {
    getAll: () => fetchWithAuth('/notifications'),
    markAsRead: (id: number) => fetchWithAuth(`/notifications/${id}/read`, { method: 'POST' }),
  }
};
