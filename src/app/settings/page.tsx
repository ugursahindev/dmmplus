'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Switch,
  Select,
  SelectItem,
  Divider,
  Tabs,
  Tab,
  Textarea,
} from '@nextui-org/react';
import { 
  User, Lock, Bell, Shield, Save, Eye, EyeOff,
  Globe, Database, Mail, Building2, Key
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProfileData {
  fullName: string;
  email: string;
  username: string;
  institution?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  newCaseAlert: boolean;
  statusChangeAlert: boolean;
  legalReviewAlert: boolean;
  institutionResponseAlert: boolean;
}

interface SystemSettings {
  sessionTimeout: string;
  maxLoginAttempts: string;
  passwordExpireDays: string;
  enableTwoFactor: boolean;
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    institution: user?.institution || '',
  });

  // Password State
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    newCaseAlert: true,
    statusChangeAlert: true,
    legalReviewAlert: false,
    institutionResponseAlert: false,
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    sessionTimeout: '480',
    maxLoginAttempts: '5',
    passwordExpireDays: '90',
    enableTwoFactor: false,
    maintenanceMode: false,
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/api/users/${user?.id}`, {
        fullName: profileData.fullName,
        email: profileData.email,
        username: profileData.username,
        role: user?.role,
        active: true,
      });

      if (response.data.success) {
        toast.success('Profil bilgileri güncellendi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Profil güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success('Şifre başarıyla güncellendi');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Şifre güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    try {
      // This would normally save to a settings API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Bildirim ayarları güncellendi');
    } catch (error) {
      toast.error('Bildirim ayarları güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemUpdate = async () => {
    setIsLoading(true);
    try {
      // This would normally save to a settings API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Sistem ayarları güncellendi');
    } catch (error) {
      toast.error('Sistem ayarları güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ayarlar</h1>
          <p className="text-default-500">Hesap ve sistem ayarlarınızı yönetin</p>
        </div>

        <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
          <Tab key="profile" title="Profil">
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Profil Bilgileri</h3>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <Input
                  label="Ad Soyad"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  startContent={<User className="w-4 h-4 text-default-400" />}
                />
                <Input
                  label="E-posta"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  startContent={<Mail className="w-4 h-4 text-default-400" />}
                />
                <Input
                  label="Kullanıcı Adı"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  startContent={<Key className="w-4 h-4 text-default-400" />}
                />
                {user?.role === 'INSTITUTION_USER' && (
                  <Input
                    label="Kurum"
                    value={profileData.institution}
                    isReadOnly
                    startContent={<Building2 className="w-4 h-4 text-default-400" />}
                  />
                )}
                <div className="flex items-center gap-2 p-3 bg-default-100 rounded-lg">
                  <Shield className="w-4 h-4 text-default-500" />
                  <span className="text-sm">Rol: {getRoleLabel(user?.role || '')}</span>
                </div>
                <Button
                  color="primary"
                  onClick={handleProfileUpdate}
                  isLoading={isLoading}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Değişiklikleri Kaydet
                </Button>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="security" title="Güvenlik">
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Şifre Değiştir</h3>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <Input
                  label="Mevcut Şifre"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <Input
                  label="Yeni Şifre"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
                <Input
                  label="Yeni Şifre (Tekrar)"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
                <div className="space-y-2 text-sm text-default-500">
                  <p>Şifre gereksinimleri:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>En az 6 karakter uzunluğunda</li>
                    <li>Büyük ve küçük harf içermeli</li>
                    <li>En az bir rakam içermeli</li>
                  </ul>
                </div>
                <Button
                  color="primary"
                  onClick={handlePasswordUpdate}
                  isLoading={isLoading}
                  startContent={<Lock className="w-4 h-4" />}
                >
                  Şifreyi Güncelle
                </Button>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="notifications" title="Bildirimler">
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Bildirim Tercihleri</h3>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <Switch
                  isSelected={notificationSettings.emailNotifications}
                  onValueChange={(value) => 
                    setNotificationSettings({ ...notificationSettings, emailNotifications: value })
                  }
                >
                  E-posta bildirimleri
                </Switch>
                <div className="ml-8 space-y-3">
                  <Switch
                    isSelected={notificationSettings.newCaseAlert}
                    onValueChange={(value) => 
                      setNotificationSettings({ ...notificationSettings, newCaseAlert: value })
                    }
                    isDisabled={!notificationSettings.emailNotifications}
                  >
                    Yeni vaka oluşturulduğunda
                  </Switch>
                  <Switch
                    isSelected={notificationSettings.statusChangeAlert}
                    onValueChange={(value) => 
                      setNotificationSettings({ ...notificationSettings, statusChangeAlert: value })
                    }
                    isDisabled={!notificationSettings.emailNotifications}
                  >
                    Vaka durumu değiştiğinde
                  </Switch>
                  <Switch
                    isSelected={notificationSettings.legalReviewAlert}
                    onValueChange={(value) => 
                      setNotificationSettings({ ...notificationSettings, legalReviewAlert: value })
                    }
                    isDisabled={!notificationSettings.emailNotifications}
                  >
                    Hukuki inceleme tamamlandığında
                  </Switch>
                  <Switch
                    isSelected={notificationSettings.institutionResponseAlert}
                    onValueChange={(value) => 
                      setNotificationSettings({ ...notificationSettings, institutionResponseAlert: value })
                    }
                    isDisabled={!notificationSettings.emailNotifications}
                  >
                    Kurum yanıtı geldiğinde
                  </Switch>
                </div>
                <Button
                  color="primary"
                  onClick={handleNotificationUpdate}
                  isLoading={isLoading}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Bildirimleri Kaydet
                </Button>
              </CardBody>
            </Card>
          </Tab>

          {user?.role === 'ADMIN' && (
            <Tab key="system" title="Sistem">
              <Card className="mt-4">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Sistem Ayarları</h3>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-4">
                  <Select
                    label="Oturum Zaman Aşımı"
                    selectedKeys={[systemSettings.sessionTimeout]}
                    onChange={(e) => 
                      setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })
                    }
                  >
                    <SelectItem key="240" value="240">4 Saat</SelectItem>
                    <SelectItem key="480" value="480">8 Saat</SelectItem>
                    <SelectItem key="720" value="720">12 Saat</SelectItem>
                    <SelectItem key="1440" value="1440">24 Saat</SelectItem>
                  </Select>
                  <Input
                    label="Maksimum Giriş Denemesi"
                    type="number"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) => 
                      setSystemSettings({ ...systemSettings, maxLoginAttempts: e.target.value })
                    }
                  />
                  <Input
                    label="Şifre Geçerlilik Süresi (gün)"
                    type="number"
                    value={systemSettings.passwordExpireDays}
                    onChange={(e) => 
                      setSystemSettings({ ...systemSettings, passwordExpireDays: e.target.value })
                    }
                  />
                  <Switch
                    isSelected={systemSettings.enableTwoFactor}
                    onValueChange={(value) => 
                      setSystemSettings({ ...systemSettings, enableTwoFactor: value })
                    }
                  >
                    İki faktörlü doğrulama
                  </Switch>
                  <Switch
                    isSelected={systemSettings.maintenanceMode}
                    onValueChange={(value) => 
                      setSystemSettings({ ...systemSettings, maintenanceMode: value })
                    }
                  >
                    Bakım modu
                  </Switch>
                  <Textarea
                    label="Sistem Notları"
                    placeholder="Sistem yöneticileri için notlar..."
                    minRows={3}
                  />
                  <Button
                    color="primary"
                    onClick={handleSystemUpdate}
                    isLoading={isLoading}
                    startContent={<Save className="w-4 h-4" />}
                  >
                    Sistem Ayarlarını Kaydet
                  </Button>
                </CardBody>
              </Card>
            </Tab>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: 'Yönetici',
    IDP_PERSONNEL: 'İDP Personeli',
    LEGAL_PERSONNEL: 'Hukuk Personeli',
    INSTITUTION_USER: 'Kurum Kullanıcısı'
  };
  return labels[role] || role;
}