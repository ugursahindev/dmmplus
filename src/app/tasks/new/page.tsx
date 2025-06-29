'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  DatePicker,
  Autocomplete,
  AutocompleteItem,
  User,
  Divider,
} from '@nextui-org/react';
import { ArrowLeft, Save, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { parseDate } from '@internationalized/date';

interface UserData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

interface CaseData {
  id: number;
  caseNumber: string;
  title: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchingCases, setSearchingCases] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    caseId: '',
    dueDate: null as any,
    initialComment: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchCases();
  }, []);

  const fetchUsers = async (search?: string) => {
    try {
      setSearchingUsers(true);
      const params = search ? `?search=${search}` : '';
      const response = await axiosInstance.get(`/api/users${params}`);
      // Filter only IDP and Legal personnel
      const filteredUsers = response.data.users.filter((user: UserData) => 
        user.role === 'IDP_PERSONNEL' || user.role === 'LEGAL_PERSONNEL'
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const fetchCases = async (search?: string) => {
    try {
      setSearchingCases(true);
      const params = search ? `?search=${search}` : '';
      const response = await axiosInstance.get(`/api/cases${params}`);
      setCases(response.data.cases);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setSearchingCases(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.assignedToId) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        dueDate: formData.dueDate ? formData.dueDate.toString() : null,
        caseId: formData.caseId || null
      };

      await axiosInstance.post('/api/tasks', data);
      toast.success('Görev başarıyla oluşturuldu');
      router.push('/tasks');
    } catch (error: any) {
      console.error('Create task error:', error);
      toast.error(error.response?.data?.error || 'Görev oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'IDP_PERSONNEL': 'IDP Personeli',
      'LEGAL_PERSONNEL': 'Hukuk Personeli'
    };
    return labels[role] || role;
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Yeni Görev Oluştur</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Görev Bilgileri</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Görev Başlığı"
                placeholder="Görevi kısa ve net tanımlayın"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />

              <Textarea
                label="Görev Açıklaması"
                placeholder="Detaylı açıklama, beklentiler ve gereksinimler"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                minRows={4}
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Öncelik"
                  placeholder="Öncelik seçin"
                  selectedKeys={[formData.priority]}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <SelectItem key="LOW" value="LOW">Düşük</SelectItem>
                  <SelectItem key="MEDIUM" value="MEDIUM">Orta</SelectItem>
                  <SelectItem key="HIGH" value="HIGH">Yüksek</SelectItem>
                  <SelectItem key="CRITICAL" value="CRITICAL">Kritik</SelectItem>
                </Select>

                <DatePicker
                  label="Termin Tarihi"
                  value={formData.dueDate}
                  onChange={(date) => setFormData({ ...formData, dueDate: date })}
                  granularity="day"
                />
              </div>

              <Divider />

              <Autocomplete
                label="Görev Atanacak Kişi"
                placeholder="Kullanıcı ara..."
                isRequired
                isLoading={searchingUsers}
                selectedKey={formData.assignedToId}
                onSelectionChange={(key) => setFormData({ ...formData, assignedToId: key as string })}
                onInputChange={(value) => {
                  if (value.length > 2) fetchUsers(value);
                }}
                startContent={<Search className="w-4 h-4 text-default-400" />}
              >
                {users.map((user) => (
                  <AutocompleteItem key={user.id} value={user.id}>
                    <User
                      name={user.fullName}
                      description={`${user.username} - ${getRoleLabel(user.role)}`}
                      avatarProps={{
                        name: user.fullName,
                        size: "sm"
                      }}
                    />
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              <Autocomplete
                label="İlgili Vaka (Opsiyonel)"
                placeholder="Vaka ara..."
                isLoading={searchingCases}
                selectedKey={formData.caseId}
                onSelectionChange={(key) => setFormData({ ...formData, caseId: key as string })}
                onInputChange={(value) => {
                  if (value.length > 2) fetchCases(value);
                }}
                startContent={<Search className="w-4 h-4 text-default-400" />}
              >
                {cases?.map((caseItem) => (
                  <AutocompleteItem key={caseItem.id} value={caseItem.id}>
                    <div>
                      <p className="font-medium">{caseItem.caseNumber}</p>
                      <p className="text-sm text-default-500">{caseItem.title}</p>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              <Divider />

              <Textarea
                label="İlk Yorum (Opsiyonel)"
                placeholder="Görevle ilgili ek bilgi veya talimatlar"
                value={formData.initialComment}
                onChange={(e) => setFormData({ ...formData, initialComment: e.target.value })}
                minRows={3}
              />
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="light"
              onPress={() => router.back()}
              isDisabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              color="primary"
              startContent={<Save className="w-4 h-4" />}
              isLoading={loading}
            >
              Görevi Oluştur
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}