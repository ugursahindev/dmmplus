'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useRequireAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Spinner } from '@nextui-org/react';

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { isLoading } = useRequireAuth(allowedRoles);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}