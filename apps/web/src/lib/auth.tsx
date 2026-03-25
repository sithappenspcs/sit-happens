'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';

interface AuthUser {
  userId: number;
  email: string;
  role: 'admin' | 'staff' | 'client';
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isRole: (role: 'admin' | 'staff' | 'client') => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isRole: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateFromStorage = useCallback(async () => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        const profile = await api.auth.profile();
        setUser(profile);
        localStorage.setItem('auth_user', JSON.stringify(profile));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    const { access_token } = data;
    localStorage.setItem('auth_token', access_token);

    // Decode payload to get user info immediately
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    const userData = { userId: payload.sub, email: payload.email, role: payload.role };
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.auth.register(name, email, password);
    const { access_token } = data;
    localStorage.setItem('auth_token', access_token);
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    const userData = { userId: payload.sub, email: payload.email, role: payload.role };
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const isRole = (role: 'admin' | 'staff' | 'client') => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
