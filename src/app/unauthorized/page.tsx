'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-default-100 to-default-200 dark:from-default-50 dark:to-default-100 p-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center p-8 space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-danger-100 dark:bg-danger-900/20">
              <ShieldOff className="w-16 h-16 text-danger-600 dark:text-danger-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-danger-600 dark:text-danger-400">
              Yetkisiz Erişim
            </h1>
            <p className="text-default-600">
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </p>
            <p className="text-sm text-default-500">
              Bu işlemi gerçekleştirmek için gerekli izinlere sahip değilsiniz. 
              Yardıma ihtiyacınız varsa sistem yöneticinizle iletişime geçin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              color="primary"
              variant="flat"
              startContent={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.back()}
            >
              Geri Dön
            </Button>
            <Button
              color="primary"
              startContent={<Home className="w-4 h-4" />}
              onClick={() => router.push('/dashboard')}
            >
              Ana Sayfaya Git
            </Button>
          </div>

          <div className="pt-4 border-t border-default-200 dark:border-default-800">
            <p className="text-xs text-default-400">
              Hata Kodu: 403 - Forbidden
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}