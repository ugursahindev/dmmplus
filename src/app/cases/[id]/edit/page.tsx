'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Chip,
  Divider,
  Spinner,
} from '@nextui-org/react';
import { ArrowLeft, Save, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const platforms = [
  { key: 'TWITTER', label: 'Twitter' },
  { key: 'FACEBOOK', label: 'Facebook' },
  { key: 'INSTAGRAM', label: 'Instagram' },
  { key: 'YOUTUBE', label: 'YouTube' },
  { key: 'WHATSAPP', label: 'WhatsApp' },
  { key: 'TELEGRAM', label: 'Telegram' },
  { key: 'TIKTOK', label: 'TikTok' },
  { key: 'OTHER', label: 'Diğer' },
];

const priorities = [
  { key: 'LOW', label: 'Düşük' },
  { key: 'MEDIUM', label: 'Orta' },
  { key: 'HIGH', label: 'Yüksek' },
  { key: 'CRITICAL', label: 'Kritik' },
];

const geographicScopes = [
  { key: 'LOCAL', label: 'Yerel' },
  { key: 'REGIONAL', label: 'Bölgesel' },
  { key: 'NATIONAL', label: 'Ulusal' },
  { key: 'INTERNATIONAL', label: 'Uluslararası' },
];

const sourceTypes = [
  { key: 'SOCIAL_MEDIA', label: 'Sosyal Medya' },
  { key: 'NEWS_SITE', label: 'Haber Sitesi' },
  { key: 'BLOG', label: 'Blog' },
  { key: 'FORUM', label: 'Forum' },
  { key: 'MESSAGING_APP', label: 'Mesajlaşma Uygulaması' },
  { key: 'OTHER', label: 'Diğer' },
];

interface CaseData {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  platform: string;
  priority: string;
  status: string;
  geographicScope: string;
  sourceType: string;
  sourceUrl?: string;
  idpAssessment?: string;
  idpNotes?: string;
  tags: string[] | string;
}

export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    priority: 'MEDIUM',
    geographicScope: 'NATIONAL',
    sourceType: 'SOCIAL_MEDIA',
    sourceUrl: '',
    idpAssessment: '',
    idpNotes: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchCase();
  }, [params.id]);

  const fetchCase = async () => {
    try {
      const response = await axiosInstance.get(`/api/cases/${params.id}`);
      if (response.data.success) {
        const data = response.data.data;
        setCaseData(data);
        
        // Parse tags if needed
        const tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
        
        setFormData({
          title: data.title,
          description: data.description,
          platform: data.platform,
          priority: data.priority,
          geographicScope: data.geographicScope,
          sourceType: data.sourceType,
          sourceUrl: data.sourceUrl || '',
          idpAssessment: data.idpAssessment || '',
          idpNotes: data.idpNotes || '',
          tags: tags || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch case:', error);
      toast.error('Vaka yüklenirken hata oluştu');
      router.push('/cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.platform) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axiosInstance.put(`/api/cases/${params.id}`, {
        ...formData,
        tags: formData.tags, // API will handle the JSON conversion
      });
      
      if (response.data.success) {
        toast.success('Vaka başarıyla güncellendi');
        router.push(`/cases/${params.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Vaka güncellenirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return null;
  }

  // Check if user can edit this case
  const canEdit = user?.role === 'ADMIN' || 
    (user?.role === 'IDP_PERSONNEL' && caseData.status === 'IDP_FORM');

  if (!canEdit) {
    toast.error('Bu vakayı düzenleme yetkiniz yok');
    router.push(`/cases/${params.id}`);
    return null;
  }

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL']}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Vaka Düzenle</h1>
            <p className="text-default-500">Vaka No: {caseData.caseNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Vaka Bilgileri</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vaka Başlığı"
                  placeholder="Vaka başlığını girin"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  isRequired
                />
                <Select
                  label="Platform"
                  placeholder="Platform seçin"
                  selectedKeys={formData.platform ? [formData.platform] : []}
                  onChange={(e) => handleChange('platform', e.target.value)}
                  isRequired
                >
                  {platforms.map((platform) => (
                    <SelectItem key={platform.key} value={platform.key}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Açıklama"
                placeholder="Vaka detaylarını açıklayın"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                minRows={4}
                isRequired
              />

              {/* Detay Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Öncelik"
                  selectedKeys={[formData.priority]}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {priorities.map((priority) => (
                    <SelectItem key={priority.key} value={priority.key}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Coğrafi Kapsam"
                  selectedKeys={[formData.geographicScope]}
                  onChange={(e) => handleChange('geographicScope', e.target.value)}
                >
                  {geographicScopes.map((scope) => (
                    <SelectItem key={scope.key} value={scope.key}>
                      {scope.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Kaynak Tipi"
                  selectedKeys={[formData.sourceType]}
                  onChange={(e) => handleChange('sourceType', e.target.value)}
                >
                  {sourceTypes.map((type) => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Kaynak URL"
                  placeholder="https://..."
                  value={formData.sourceUrl}
                  onChange={(e) => handleChange('sourceUrl', e.target.value)}
                />
              </div>

              {/* Etiketler */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Etiketler</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Etiket ekle"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    color="primary"
                    variant="flat"
                    onClick={addTag}
                  >
                    Ekle
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        onClose={() => removeTag(tag)}
                        variant="flat"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              <Divider />

              {/* IDP Değerlendirmesi */}
              <h3 className="text-md font-semibold">İlk Değerlendirme</h3>
              
              <Textarea
                label="IDP Değerlendirmesi"
                placeholder="İlk değerlendirmenizi yazın"
                value={formData.idpAssessment}
                onChange={(e) => handleChange('idpAssessment', e.target.value)}
                minRows={3}
              />

              <Textarea
                label="IDP Notları"
                placeholder="Ek notlarınızı ekleyin"
                value={formData.idpNotes}
                onChange={(e) => handleChange('idpNotes', e.target.value)}
                minRows={3}
              />

              {/* Durum Bilgisi */}
              <div className="p-4 bg-default-100 rounded-lg">
                <p className="text-sm text-default-600">
                  <strong>Mevcut Durum:</strong> {caseData.status}
                </p>
                <p className="text-xs text-default-500 mt-1">
                  Not: Sadece temel bilgiler ve IDP değerlendirmesi güncellenebilir. 
                  Durum değişiklikleri için vaka detay sayfasındaki işlemler bölümünü kullanın.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="light"
                  onClick={() => router.back()}
                  isDisabled={isSaving}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  startContent={<Save className="w-4 h-4" />}
                  isLoading={isSaving}
                >
                  Güncelle
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}