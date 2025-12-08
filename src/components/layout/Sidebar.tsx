'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Users,
  BarChart3,
  LogOut,
  Shield,
  Settings,
  MessageSquare,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Button, Accordion, AccordionItem } from '@nextui-org/react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { ThemeToggle } from '../ThemeToggle';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  roles: UserRole[];
  subItems?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  }[];
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
    roles: ['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL', 'INSTITUTION_USER'],
    subItems: [
      {
        label: 'Tüm Vakalar',
        href: '/cases',
        icon: <FileText className="w-4 h-4" />,
      },
      {
        label: 'İşlem Bekleyenler',
        href: '/cases/pending',
        icon: <Clock className="w-4 h-4" />,
      },
    ],
  },
  /*
  {
    icon: <CheckSquare className="w-5 h-5" />,
    label: 'Görevler',
    href: '/tasks',
    roles: ['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL'],
  },
  */
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
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">DMM</h1>
            <p className="text-xs text-default-500">Yönetim Paneli</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <div>
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-default-500">
            {user.role === 'ADMIN' && 'Yönetici'}
            {user.role === 'IDP_PERSONNEL' && 'IDP Personeli'}
            {user.role === 'LEGAL_PERSONNEL' && 'Hukuk Personeli'}
            {user.role === 'INSTITUTION_USER' && 'Kurum Sorumlusu'}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          // SubItem'ları olan item'lar için: eğer pathname bir subItem ile eşleşiyorsa, parent aktif olmamalı
          let isActive = false;
          if (hasSubItems) {
            // SubItem'ları olan item'lar için, sadece tam olarak parent href ile eşleşiyorsa aktif
            isActive = pathname === item.href;
          } else {
            // SubItem'ları olmayan item'lar için normal kontrol
            isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          }
          
          // Accordion için açık olup olmadığını kontrol et
          const isAccordionOpen = hasSubItems && (
            pathname === item.href || 
            item.subItems?.some(subItem => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`))
          );
          
          if (hasSubItems) {
            return (
              <Accordion
                key={item.href}
                defaultExpandedKeys={isAccordionOpen ? [item.href] : []}
                className="mb-1"
                itemClasses={{
                  base: 'mb-1',
                  title: 'text-sm font-medium',
                  trigger: 'px-2 py-2 min-h-12',
                  content: 'px-2 pb-2',
                }}
              >
                <AccordionItem
                  key={item.href}
                  aria-label={item.label}
                  title={
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3" style={{ paddingLeft: '9px', fontWeight: 400 }}>{item.label}</span>
                    </div>
                  }
                  indicator={({ isOpen }) => (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ''}`} />
                  )}
                >
                  <div className="space-y-1">
                    {item.subItems?.map((subItem) => {
                      // SubItem aktif kontrolü: 
                      // 1. pathname tam olarak subItem href'i ile eşleşmeli
                      // 2. VEYA pathname subItem href'i ile başlamalı (ama parent href'i ile tam eşleşmemeli)
                      // 3. ÖNEMLİ: Eğer subItem href'i parent href'i ile aynıysa (örn: /cases), 
                      //    sadece tam eşleşme durumunda aktif olmalı
                      let isSubActive = false;
                      
                      if (subItem.href === item.href) {
                        // SubItem parent ile aynı href'e sahipse (örn: "Tüm Vakalar" = /cases)
                        // Sadece tam eşleşme durumunda aktif olmalı
                        isSubActive = pathname === subItem.href;
                      } else {
                        // SubItem farklı bir href'e sahipse (örn: "İşlem Bekleyenler" = /cases/pending)
                        // Pathname subItem href'i ile eşleşmeli veya onunla başlamalı
                        isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                      }
                      
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <Button
                            variant={isSubActive ? 'flat' : 'light'}
                            color={isSubActive ? 'primary' : 'default'}
                            className="w-full justify-start"
                            size="sm"
                          >
                            {subItem.icon}
                            <span className="ml-2">{subItem.label}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionItem>
              </Accordion>
            );
          }
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'flat' : 'light'}
                color={isActive ? 'primary' : 'default'}
                className="w-full justify-start mb-1"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            variant="light"
            color="danger"
            className="flex-1 justify-start"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Çıkış Yap</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>

    </aside>
  );
}