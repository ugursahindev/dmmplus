'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, UserRole } from '@/types';
import { demoAPI, storage } from '@/lib/demo-data';

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
    const savedToken = storage.getToken();
    if (savedToken) {
      setToken(savedToken);
      
      try {
        const userData = await demoAPI.getCurrentUser();
        setUser(userData);
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

  const login = async (username: string, password: string, fromUrl?: string | null) => {
    try {
      const { user: userData, token: newToken } = await demoAPI.login(username, password);
      
      setToken(newToken);
      setUser(userData);
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

  const logout = async () => {
    try {
      await demoAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
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