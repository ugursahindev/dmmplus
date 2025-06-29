'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Gavel,
  Building2,
  Settings,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { Button } from '@nextui-org/react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { ThemeToggle } from '../ThemeToggle';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="w-5 h-5" />,
    label: 'Ana Sayfa',
    href: '/dashboard',
    roles: ['ADMIN', 'IDP_PERSONNEL'],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: 'Vakalar',
    href: '/cases',
    roles: ['ADMIN', 'IDP_PERSONNEL'],
  },
  {
    icon: <Gavel className="w-5 h-5" />,
    label: 'Hukuki İncelemeler',
    href: '/legal',
    roles: ['ADMIN', 'LEGAL_PERSONNEL'],
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    label: 'Kurum Yanıtları',
    href: '/institution',
    roles: ['ADMIN', 'INSTITUTION_USER'],
  },
  {
    icon: <CheckSquare className="w-5 h-5" />,
    label: 'Görevler',
    href: '/tasks',
    roles: ['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL'],
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Mesajlar',
    href: '/messages',
    roles: ['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL', 'INSTITUTION_USER'],
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: 'İstatistikler',
    href: '/stats',
    roles: ['ADMIN', 'IDP_PERSONNEL'],
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: 'Kullanıcılar',
    href: '/users',
    roles: ['ADMIN'],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: 'Ayarlar',
    href: '/settings',
    roles: ['ADMIN'],
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className={`${
      isCollapsed ? 'w-16' : 'w-64'
    } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-screen`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <Shield className="w-8 h-8 text-primary" />
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold">DMM</h1>
                <p className="text-xs text-default-500">Yönetim Paneli</p>
              </div>
            )}
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={isCollapsed ? 'mx-auto' : ''}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-default-500">
            {user.role === 'ADMIN' && 'Yönetici'}
            {user.role === 'IDP_PERSONNEL' && 'IDP Personeli'}
            {user.role === 'LEGAL_PERSONNEL' && 'Hukuk Personeli'}
            {user.role === 'INSTITUTION_USER' && 'Kurum Sorumlusu'}
          </p>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 p-2">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'flat' : 'light'}
                color={isActive ? 'primary' : 'default'}
                className={`w-full justify-start mb-1 ${
                  isCollapsed ? 'px-2' : ''
                }`}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-center mb-2">
          <ThemeToggle />
        </div>
        <Button
          variant="light"
          color="danger"
          className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Çıkış Yap</span>}
        </Button>
      </div>
    </aside>
  );
}