'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Divider } from '@nextui-org/react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();

  // Get redirect URL from search params
  const fromUrl = searchParams?.get('from');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    try {
      await login(username, password, fromUrl);
    } catch (error) {
      // Error is handled in the login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">DMM Demo</h1>
          </div>
          <p className="text-sm text-default-500">Dezinformasyonla Mücadele Merkezi - Demo Uygulaması</p>
        </CardHeader>
        <Divider />
        <CardBody className="py-8 px-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Kullanıcı Adı"
              placeholder="Kullanıcı adınızı girin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="bordered"
              isRequired
            />
            <Input
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="bordered"
              endContent={
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="focus:outline-none"
                >
                  
                  {isVisible ? (
                    <EyeOff className="w-4 h-4 text-default-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-default-400" />
                  )}
                </button>
              }
              type={isVisible ? 'text' : 'password'}
              isRequired
            />
            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={isLoading}
              className="mt-4"
            >
              Giriş Yap
            </Button>
          </form>
          
          <Divider className="my-6" />
          
          <div className="space-y-2 text-sm text-default-500">
            <p className="font-semibold">Demo Kullanıcılar:</p>
            <ul className="space-y-1 ml-4">
              <li>• Admin: admin / 123456</li>
              <li>• IDP Personeli: idp_user / 123456</li>
              <li>• Hukuk Personeli: legal_user / 123456</li>
              <li>• Kurum Kullanıcısı: kurum_user / 123456</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}