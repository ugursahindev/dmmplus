'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, UserRole } from '@/types';
import { api, setApiLogoutCallback } from '@/lib/api';
import { log } from 'console';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, fromUrl?: string | null) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage helper functions
const storage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('dmm_auth_token');
  },
  setToken: (token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('dmm_auth_token', token);
    } else {
      localStorage.removeItem('dmm_auth_token');
    }
  },
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('dmm_current_user');
    return stored ? JSON.parse(stored) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('dmm_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dmm_current_user');
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const savedToken = storage.getToken();
    if (savedToken) {
      setToken(savedToken);
      
      try {
        const userData = await api.getCurrentUser(savedToken);
        setUser(userData);
        storage.setCurrentUser(userData);
      } catch (error) {
        console.error('checkAuth error:', error);
        storage.setToken(null);
        storage.setCurrentUser(null);
        setUser(null);
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = storage.getToken();
    const savedUser = storage.getCurrentUser();
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    
    setIsLoading(false);
  }, []);

  // Set up the logout callback for API error handling
  useEffect(() => {
    setApiLogoutCallback(() => {
      logout(true); // true indicates auto-logout due to server error
    });
  }, []);

  const login = async (username: string, password: string, fromUrl?: string | null) => {
    try {
      const { user: userData, token: newToken } = await api.login(username, password);
      
      setToken(newToken);
      setUser(userData);
      storage.setToken(newToken);
      storage.setCurrentUser(userData);
      setIsLoading(false);
      
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
    } catch (error: any) {
      toast.error(error.message || 'Giriş başarısız');
      throw error;
    }
  };

  const logout = async (isAutoLogout = false) => {
    try {
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    setUser(null);
    setToken(null);
    storage.setToken(null);
    storage.setCurrentUser(null);
    
    // Show different message based on logout type
    if (isAutoLogout) {
      toast.error('Sunucu hatası nedeniyle oturumunuz sonlandırıldı');
    } else {
      toast.success('Çıkış yapıldı');
    }
    
    // Use window.location.href for guaranteed navigation to login page
    window.location.href = '/login';
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    storage.setCurrentUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, checkAuth, updateUser }}>
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