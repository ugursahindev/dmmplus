'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (savedToken) {
      setToken(savedToken);
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { username, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        localStorage.setItem('token', newToken);
        
        setToken(newToken);
        setUser(userData);
        
        toast.success('Giriş başarılı!');
        
        // Redirect based on role
        switch (userData.role) {
          case 'ADMIN':
          case 'IDP_PERSONNEL':
            router.push('/dashboard');
            break;
          case 'LEGAL_PERSONNEL':
            router.push('/legal');
            break;
          case 'INSTITUTION_USER':
            router.push('/institution');
            break;
          default:
            router.push('/');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Giriş başarısız');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    setToken(null);
    toast.success('Çıkış yapıldı');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, isLoading, allowedRoles, router]);

  return { user, isLoading };
}