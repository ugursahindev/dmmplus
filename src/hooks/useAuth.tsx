'use client';

import { createContext, useContext, useEffect, useCallback, ReactNode, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { User, UserRole } from '@/types';
import { setApiLogoutCallback } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, fromUrl?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const determineRedirectPath = (role?: UserRole | null, requestedPath?: string | null) => {
  if (requestedPath && requestedPath !== '/login') {
    return requestedPath;
  }

  switch (role) {
    case 'ADMIN':
    case 'IDP_PERSONNEL':
      return '/dashboard';
    case 'LEGAL_PERSONNEL':
      return '/cases/pending';
    case 'INSTITUTION_USER':
      return '/cases/pending';
    default:
      return '/dashboard';
  }
};

const mapSessionUserToAppUser = (sessionUser: any): User => ({
  id: sessionUser.id,
  username: sessionUser.username,
  email: sessionUser.email ?? '',
  fullName: sessionUser.fullName ?? sessionUser.name ?? '',
  role: sessionUser.role,
  institution: sessionUser.institution ?? undefined,
  active: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const wasAuthenticatedRef = useRef(false);

  const user = useMemo(() => {
    if (!session?.user) return null;
    return mapSessionUserToAppUser(session.user);
  }, [session]);

  const token = session?.user?.apiToken ?? session?.apiToken ?? null;
  const isLoading = status === 'loading';

  const performLogout = useCallback(
    async (isAutoLogout = false) => {
      await signOut({ redirect: false });
      wasAuthenticatedRef.current = false;

      if (isAutoLogout) {
        toast.error('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
      } else {
        toast.success('Çıkış yapıldı');
      }

      router.push('/login');
    },
    [router]
  );

  useEffect(() => {
    setApiLogoutCallback(() => {
      performLogout(true);
    });
  }, [performLogout]);

  useEffect(() => {
    if (status === 'authenticated') {
      wasAuthenticatedRef.current = true;
      return;
    }

    if (wasAuthenticatedRef.current && status === 'unauthenticated') {
      performLogout(true);
      wasAuthenticatedRef.current = false;
    }
  }, [status, performLogout]);

  const login = useCallback(
    async (username: string, password: string, fromUrl?: string | null) => {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        const message = result.error === 'CredentialsSignin'
          ? 'Geçersiz kullanıcı adı veya şifre'
          : result.error || 'Giriş başarısız';
        toast.error(message);
        throw new Error(message);
      }

      toast.success('Giriş başarılı!');
      const refreshedSession = await getSession();
      const role = refreshedSession?.user?.role as UserRole | undefined;
      const redirectPath = determineRedirectPath(role ?? null, fromUrl ?? null);
      router.push(redirectPath);
    },
    [router]
  );

  const checkAuth = useCallback(async () => {
    await getSession();
  }, []);

  const updateUser = useCallback(
    (userData: User) => {
      if (!session?.user) return;

      void update({
        ...session,
        user: {
          ...session.user,
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          institution: userData.institution ?? null,
        },
      });
    },
    [session, update]
  );

  const logout = useCallback(() => performLogout(false), [performLogout]);

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