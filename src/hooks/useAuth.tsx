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
  login: (username: string, password: string, fromUrl?: string | null) => Promise<void>;
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
      console.log('checkAuth response:', response);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        throw new Error('Auth check failed');
      }
    } catch (error) {
      console.error('checkAuth error:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Clear cookie by setting it to expire
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      // Clear axios default headers
      delete axiosInstance.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state from localStorage - only run once
  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          throw new Error('Auth check failed');
        }
      } catch (error) {
        console.error('Initial auth check error:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Clear cookie by setting it to expire
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        // Clear axios default headers
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (savedToken) {
      setToken(savedToken);
      // Set the token in axios headers immediately
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      // Call auth check to get user data
      performAuthCheck();
    } else {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - only run once on mount

  const login = async (username: string, password: string, fromUrl?: string | null) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { username, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        // Set both localStorage and cookie
        localStorage.setItem('token', newToken);
        
        // Manually set cookie for immediate availability with correct security settings
        const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax${secureFlag}`;
        
        // Also set the token in axios default headers immediately
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        setToken(newToken);
        setUser(userData);
        setIsLoading(false);
        
        // Debug: Check if cookie was set correctly
        setTimeout(() => {
          const cookieValue = document.cookie.split(';').find(c => c.trim().startsWith('token='));
          console.log('Cookie after login:', cookieValue);
          console.log('All cookies:', document.cookie);
        }, 100);
        
        toast.success('Giriş başarılı!');
        
        // Use fromUrl if provided, otherwise determine by role
        let redirectPath = fromUrl;
        
        if (!redirectPath || redirectPath === '/login') {
          redirectPath = (() => {
            switch (userData.role) {
              case 'ADMIN':
              case 'IDP_PERSONNEL':
                return '/dashboard';
              case 'LEGAL_PERSONNEL':
                return '/legal';
              case 'INSTITUTION_USER':
                return '/institution';
              default:
                return '/dashboard';
            }
          })();
        }
        
        console.log('Redirecting to:', redirectPath, 'User role:', userData.role);
        
        // Use window.location for guaranteed navigation
        window.location.href = redirectPath as string;
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
      // Clear cookie by setting it to expire
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    
    // Clear axios default headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
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