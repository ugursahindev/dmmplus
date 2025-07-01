'use client';

import { useState } from 'react';
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
  Chip,
  Divider,
} from '@nextui-org/react';
import { ArrowLeft, Save, X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AIAssistant } from '@/components/AIAssistant';
import toast from 'react-hot-toast';
import { demoAPI } from '@/lib/demo-data';
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

const disinformationTypes = [
  { key: 'YALAN_HABER', label: 'Yalan Haber' },
  { key: 'MANIPULASYON', label: 'Manipülasyon' },
  { key: 'YANILTICI_ICERIK', label: 'Yanıltıcı İçerik' },
  { key: 'SAHTE_BELGE', label: 'Sahte Belge' },
  { key: 'PROPAGANDA', label: 'Propaganda' },
  { key: 'ALGI_OPERASYONU', label: 'Algı Operasyonu' },
  { key: 'DIGER', label: 'Diğer' },
];

export default function NewCasePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    // Yeni alanlar
    newsHeadline: '',
    newspaperAuthor: '',
    newsSummary: '',
    ministryInfo: '',
    relatedMinistry: '',
    submittedTo: '',
    submittingUnit: '',
    preparedBy: '',
    disinformationType: '',
    expertEvaluation: '',
    legalEvaluation: '',
    recommendationDMM: '',
    recommendationDMK: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      title: 'Başlık',
      newsSummary: 'Haber Özeti',
      platform: 'Platform',
      newsHeadline: 'Haber Başlığı',
      sourceUrl: 'Haber URL'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field as keyof typeof formData]) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      toast.error(`Lütfen şu zorunlu alanları doldurun: ${missingFields.join(', ')}`);
      return;
    }

    // Validate URL format
    if (formData.sourceUrl) {
      try {
        new URL(formData.sourceUrl);
      } catch {
        toast.error('Geçerli bir URL giriniz');
        return;
      }
    }

    setIsLoading(true);
    try {
      // Create the case
      const caseData = {
        ...formData,
        description: formData.newsSummary, // Use news summary as description
        createdById: user?.id || 1,
        status: 'IDP_FORM' as const,
        caseNumber: `DMM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        tags: formData.tags,
        geographicScope: formData.geographicScope as any,
        sourceType: formData.sourceType as any,
        platform: formData.platform as any,
        priority: formData.priority as any,
      };
      
      const newCase = await demoAPI.createCase(caseData);
      
      toast.success('Vaka başarıyla oluşturuldu');
      router.push(`/cases/${newCase.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Vaka oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL']}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Yeni Vaka Oluştur</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Vaka Bilgileri</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Başlık Bilgileri */}
              <div className="bg-default-50 p-4 rounded-lg space-y-4">
                <h3 className="text-md font-semibold">Rapor Başlığı</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Konu"
                    placeholder="Ör: İçişleri Bakanlığı"
                    value={formData.relatedMinistry}
                    onChange={(e) => handleChange('relatedMinistry', e.target.value)}
                  />
                  <Input
                    label="Sunulan Makam"
                    placeholder="Ör: İletişim Başkanlığı, Makam"
                    value={formData.submittedTo}
                    onChange={(e) => handleChange('submittedTo', e.target.value)}
                  />
                  <Input
                    label="Sunan Birim"
                    placeholder="Ör: DMM, İzleme-Değerlendirme Birimi"
                    value={formData.submittingUnit}
                    onChange={(e) => handleChange('submittingUnit', e.target.value)}
                  />
                  <Input
                    label="Hazırlayan"
                    placeholder="Ör: Bakanlıklar Takip Çalışma Grubu, Uzman ..."
                    value={formData.preparedBy}
                    onChange={(e) => handleChange('preparedBy', e.target.value)}
                  />
                </div>
              </div>

              {/* Haber Bilgileri */}
              <div className="bg-default-50 p-4 rounded-lg space-y-4">
                <h3 className="text-md font-semibold">Haber Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Haber Başlığı"
                    placeholder="Haberin başlığını girin"
                    value={formData.newsHeadline}
                    onChange={(e) => handleChange('newsHeadline', e.target.value)}
                    isRequired
                  />
                  <Input
                    label="Gazete, Yazar/Muhabir"
                    placeholder="Ör: Yeniçağ Gazetesi"
                    value={formData.newspaperAuthor}
                    onChange={(e) => handleChange('newspaperAuthor', e.target.value)}
                  />
                </div>
                <Input
                  label="Haber Linki"
                  placeholder="https://..."
                  value={formData.sourceUrl}
                  onChange={(e) => handleChange('sourceUrl', e.target.value)}
                  isRequired
                />
              </div>

              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vaka Başlığı (Kısa)"
                  placeholder="Sistemde görünecek kısa başlık"
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

              {/* Haber Özeti */}
              <Textarea
                label="Haber Özeti"
                placeholder="Haberin özetini girin"
                value={formData.newsSummary}
                onChange={(e) => handleChange('newsSummary', e.target.value)}
                minRows={4}
                isRequired
              />

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

              {/* AI Asistan */}
              <AIAssistant
                initialText={formData.newsSummary || formData.description}
                caseData={{
                  title: formData.title,
                  description: formData.description,
                  platform: formData.platform,
                  priority: formData.priority,
                  geographicScope: formData.geographicScope,
                  disinformationType: formData.disinformationType
                }}
                onSummaryGenerated={(summary) => handleChange('newsSummary', summary)}
                onTagsGenerated={(newTags) => setFormData(prev => ({ 
                  ...prev, 
                  tags: Array.from(new Set([...prev.tags, ...newTags])) 
                }))}
              />

              <Divider />

              {/* Bakanlık Bilgilendirme */}
              <div className="bg-default-50 p-4 rounded-lg space-y-4">
                <h3 className="text-md font-semibold">Bakanlık Bilgilendirme</h3>
                <Textarea
                  label="Bakanlık Bilgilendirme"
                  placeholder="Habere ilişkin konular ve cevaplar..."
                  value={formData.ministryInfo}
                  onChange={(e) => handleChange('ministryInfo', e.target.value)}
                  minRows={6}
                />
              </div>

              {/* Dezenformasyon Türü */}
              <Select
                label="Tespit Edilen Dezenformasyon Türü"
                placeholder="Dezenformasyon türünü seçin"
                selectedKeys={formData.disinformationType ? [formData.disinformationType] : []}
                onChange={(e) => handleChange('disinformationType', e.target.value)}
              >
                {disinformationTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Değerlendirmeler */}
              <div className="space-y-4">
                <Textarea
                  label="Uzman Değerlendirme Notu"
                  placeholder="Uzman değerlendirmesini girin"
                  value={formData.expertEvaluation}
                  onChange={(e) => handleChange('expertEvaluation', e.target.value)}
                  minRows={4}
                />

                <Textarea
                  label="Hukuki Değerlendirme"
                  placeholder="Hukuki değerlendirmeyi girin"
                  value={formData.legalEvaluation}
                  onChange={(e) => handleChange('legalEvaluation', e.target.value)}
                  minRows={3}
                />
              </div>

              {/* Öneri ve Teklifler */}
              <div className="bg-default-50 p-4 rounded-lg space-y-4">
                <h3 className="text-md font-semibold">Öneri ve Teklifler</h3>
                <Textarea
                  label="DMM için Gereği"
                  placeholder="DMM için öneriler..."
                  value={formData.recommendationDMM}
                  onChange={(e) => handleChange('recommendationDMM', e.target.value)}
                  minRows={3}
                />
                <Textarea
                  label="DMK için Gereği"
                  placeholder="Dijital Medya Koordinatörlüğü için öneriler..."
                  value={formData.recommendationDMK}
                  onChange={(e) => handleChange('recommendationDMK', e.target.value)}
                  minRows={3}
                />
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

              {/* Dosya Yükleme */}
              <div className="bg-default-50 p-4 rounded-lg space-y-4">
                <h3 className="text-md font-semibold">Ekler</h3>
                <div className="space-y-2">
                  <label className="text-sm text-default-600">
                    Ekran görüntüsü, belge veya diğer kanıt dosyalarını yükleyin
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      <Button
                        as="span"
                        variant="flat"
                        startContent={<Upload className="w-4 h-4" />}
                      >
                        Dosya Seç
                      </Button>
                    </label>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-default-100 rounded-lg">
                          <div className="flex items-center gap-2">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 text-default-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-default-500" />
                            )}
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-default-400">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="light"
                  onClick={() => router.back()}
                  isDisabled={isLoading}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  startContent={<Save className="w-4 h-4" />}
                  isLoading={isLoading}
                >
                  Vaka Oluştur
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}