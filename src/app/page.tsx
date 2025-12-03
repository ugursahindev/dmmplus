'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on role
        switch (user.role) {
          case 'ADMIN':
          case 'IDP_PERSONNEL':
            router.push('/dashboard');
            break;
          case 'LEGAL_PERSONNEL':
            router.push('/legal');
            break;
          case 'INSTITUTION_USER':
            router.push('/cases/pending');
            break;
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">DMM</h1>
        <p className="text-default-500">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}