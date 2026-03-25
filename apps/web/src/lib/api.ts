const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || response.statusText);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({ message: 'Login failed' }));
          throw new Error(e.message || 'Login failed');
        }
        return r.json();
      }),
    register: (name: string, email: string, password: string) =>
      fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'client' }),
      }).then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({ message: 'Registration failed' }));
          throw new Error(e.message || 'Registration failed');
        }
        return r.json();
      }),
    profile: () => fetchWithAuth('/auth/profile'),
  },

  packages: {
    getAll: () =>
      fetch(`${API_URL}/api/v1/packages`).then((r) => r.json()),
  },

  pets: {
    getAll: () => fetchWithAuth('/pets'),
    create: (data: any) =>
      fetchWithAuth('/pets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      fetchWithAuth(`/pets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchWithAuth(`/pets/${id}`, { method: 'DELETE' }),
  },

  bookings: {
    getAll: () => fetchWithAuth('/bookings'),
    create: (data: any) =>
      fetchWithAuth('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: number) =>
      fetchWithAuth(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  },

  scheduling: {
    getSlots: (params: { date: string; packageId: number; lat: number; lng: number }) => {
      const q = new URLSearchParams({
        date: params.date,
        packageId: String(params.packageId),
        lat: String(params.lat),
        lng: String(params.lng),
      });
      return fetchWithAuth(`/scheduling/availability?${q}`);
    },
  },

  staff: {
    getDashboard: () => fetchWithAuth('/staff-operations/dashboard'),
    getJobDetails: (id: string | number) => fetchWithAuth(`/staff-operations/jobs/${id}`),
    checkIn: (id: string | number, data: { photoUrls: string[]; note?: string }) =>
      fetchWithAuth('/staff-operations/check-in', {
        method: 'POST',
        body: JSON.stringify({ bookingId: id, ...data }),
      }),
    checkOut: (id: string | number, data: { photoUrls: string[]; note?: string }) =>
      fetchWithAuth('/staff-operations/check-out', {
        method: 'POST',
        body: JSON.stringify({ bookingId: id, ...data }),
      }),
    setAvailability: (data: { date: string; isAvailable: boolean; notes?: string }) =>
      fetchWithAuth('/staff-operations/availability', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    reportIncident: (data: {
      bookingId: number;
      description: string;
      severity: string;
      photoUrls: string[];
    }) => fetchWithAuth('/staff-operations/incident', { method: 'POST', body: JSON.stringify(data) }),
  },

  admin: {
    getKpis: () => fetchWithAuth('/admin/kpis'),
    getBookings: () => fetchWithAuth('/admin/bookings'),
    approveBooking: (id: number, staffId: number) =>
      fetchWithAuth(`/admin/bookings/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ staffId }),
      }),
    declineBooking: (id: number, reason: string) =>
      fetchWithAuth(`/admin/bookings/${id}/decline`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    refundBooking: (id: number) =>
      fetchWithAuth(`/admin/bookings/${id}/refund`, { method: 'POST' }),
    getPayouts: () => fetchWithAuth('/admin/payouts'),
    getStaff: () => fetchWithAuth('/admin/staff'),
    getClients: () => fetchWithAuth('/admin/clients'),
  },

  notifications: {
    getAll: () => fetchWithAuth('/notifications'),
    markAsRead: (id: number) =>
      fetchWithAuth(`/notifications/${id}/read`, { method: 'POST' }),
  },
};
