'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider,
  User,
  Tabs,
  Tab,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Gavel,
  Building2,
  Send,
  History,
  Link as LinkIcon,
  MapPin,
  Tag,
  Paperclip,
  Download
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { generateCaseReportWithTemplate, downloadReport } from '@/utils/reportGenerator';

interface CaseDetail {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  platform: string;
  priority: string;
  status: string;
  tags: string[] | string;
  geographicScope: string;
  sourceType: string;
  sourceUrl?: string;
  
  idpAssessment?: string;
  idpNotes?: string;
  expertEvaluation?: string;
  legalAssessment?: string;
  legalNotes?: string;
  legalApproved?: boolean;
  finalNotes?: string;
  finalApproval?: boolean;
  internalReport?: string;
  externalReport?: string;
  reportGeneratedDate?: string;
  targetMinistry?: string;
  targetInstitutionId?: number;
  targetInstitution?: {
    id: number;
    name: string;
  };
  institutionResponse?: string;
  correctiveInfo?: string;
  
  // Yeni vaka formu alanları
  newsHeadline?: string;
  newspaperAuthor?: string;
  newsSummary?: string;
  ministryInfo?: string;
  relatedMinistry?: string;
  submittedTo?: string;
  submittingUnit?: string;
  preparedBy?: string;
  disinformationType?: string;
  recommendation?: string;
  
  createdById: number;
  createdAt: string;
  updatedAt: string;
  
  creator: any;
  legalReviewer?: any;
  finalReviewer?: any;
  institutionResponder?: any;
  
  files: any[];
  history: any[];
}

const statusLabels: Record<string, string> = {
  IDP_FORM: 'IDP Formu',
  ADMIN_ONAYI_BEKLENIYOR: 'Admin Onayı Bekleniyor',
  KURUM_BEKLENIYOR: 'Kurum Bekleniyor',
  IDP_UZMAN_GORUSU: 'IDP Uzman Görüşü',
  HUKUK_INCELEMESI: 'Hukuk İncelemesi',
  IDP_SON_KONTROL: 'IDP Son Kontrol',
  TAMAMLANDI: 'Tamamlandı',
};

const statusIcons: Record<string, any> = {
  IDP_FORM: FileText,
  ADMIN_ONAYI_BEKLENIYOR: Clock,
  KURUM_BEKLENIYOR: Building2,
  IDP_UZMAN_GORUSU: FileText,
  HUKUK_INCELEMESI: Gavel,
  IDP_SON_KONTROL: CheckCircle,
  TAMAMLANDI: CheckCircle,
};

const priorityColors: Record<string, 'default' | 'primary' | 'warning' | 'danger'> = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  CRITICAL: 'Kritik',
};

const disinformationTypeLabels: Record<string, string> = {
  YALAN_HABER: 'Yalan Haber',
  MANIPULASYON: 'Manipülasyon',
  YANILTICI_ICERIK: 'Yanıltıcı İçerik',
  SAHTE_BELGE: 'Sahte Belge',
  PROPAGANDA: 'Propaganda',
  ALGI_OPERASYONU: 'Algı Operasyonu',
  DIGER: 'Diğer',
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);

  useEffect(() => {
    fetchCase();
    // URL'den tab parametresini kontrol et
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [params.id, searchParams]);

  const fetchCase = async () => {
    try {
      const caseData = await api.getCase(token!, Number(params.id));
      setCaseData(caseData as unknown as CaseDetail);
    } catch (error: any) {
      console.error('Failed to fetch case:', error);
      toast.error(error.message || 'Vaka yüklenirken hata oluştu');
      router.push('/cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (type: string) => {
    setActionType(type);
    setActionData({});
    
    // Eğer kurum seçimi gerekiyorsa, kurumları yükle
    if (type === 'send_to_institution' || type === 'generate_report') {
      await fetchInstitutions();
    }
    
    onOpen();
  };

  const fetchInstitutions = async () => {
    if (!token) return;
    
    try {
      setIsLoadingInstitutions(true);
      const response = await api.getInstitutions(token, { active: true });
      setInstitutions(response.institutions || []);
    } catch (error: any) {
      console.error('Failed to fetch institutions:', error);
      toast.error('Kurumlar yüklenirken hata oluştu');
    } finally {
      setIsLoadingInstitutions(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!caseData) return;
    
    try {
      toast.loading('Rapor hazırlanıyor...');
      const blob = await generateCaseReportWithTemplate(caseData);
      const filename = `Arz_Notu_${caseData.caseNumber}_${new Date().toISOString().split('T')[0]}.docx`;
      downloadReport(blob, filename);
      toast.dismiss();
      toast.success('Rapor başarıyla indirildi');
    } catch (error) {
      toast.dismiss();
      toast.error('Rapor oluşturulurken hata oluştu');
      console.error('Report generation error:', error);
    }
  };

  const submitAction = async () => {
    if (!caseData) return;

    setIsSubmitting(true);
    try {
      let updates: any = { ...actionData };

      switch (actionType) {
        case 'send_to_institution':
          if (!actionData.targetInstitutionId) {
            toast.error('Lütfen hedef kurumu seçin');
            setIsSubmitting(false);
            return;
          }
          updates.status = 'KURUM_BEKLENIYOR';
          updates.targetInstitutionId = actionData.targetInstitutionId;
          updates.targetMinistry = actionData.targetMinistry;
          break;
        case 'send_to_legal':
          updates.status = 'HUKUK_INCELEMESI';
          break;
        case 'add_expert_evaluation':
          if (!actionData.expertEvaluation || !actionData.expertEvaluation.trim()) {
            toast.error('Lütfen uzman görüşü yazın');
            setIsSubmitting(false);
            return;
          }
          updates.expertEvaluation = actionData.expertEvaluation;
          updates.status = 'ADMIN_ONAYI_BEKLENIYOR';
          break;
        case 'add_final_control':
          if (!actionData.finalNotes || !actionData.finalNotes.trim()) {
            toast.error('Lütfen son kontrol notu yazın');
            setIsSubmitting(false);
            return;
          }
          updates.finalNotes = actionData.finalNotes;
          // Öneri ve teklifler tek alanda
          updates.recommendation = actionData.recommendations || '';
          updates.finalApproval = true;
          updates.status = 'ADMIN_ONAYI_BEKLENIYOR';
          break;
        case 'legal_review':
          // Validate legal review fields
          if (!actionData.assessment || !actionData.assessment.trim()) {
            toast.error('Lütfen hukuki değerlendirme yazın');
            setIsSubmitting(false);
            return;
          }
          if (actionData.approved === undefined) {
            toast.error('Lütfen onay durumunu seçin (Onayla veya Reddet)');
            setIsSubmitting(false);
            return;
          }
          updates.status = 'IDP_SON_KONTROL';
          updates.legalAssessment = actionData.assessment;
          updates.legalNotes = actionData.notes;
          updates.legalApproved = actionData.approved;
          break;
        case 'complete_and_report':
          updates.status = 'TAMAMLANDI';
          updates.reportGeneratedDate = new Date().toISOString();
          break;
        case 'institution_response':
          if (!actionData.response || !actionData.response.trim()) {
            toast.error('Lütfen kurum yanıtı yazın');
            setIsSubmitting(false);
            return;
          }
          updates.institutionResponse = actionData.response;
          updates.correctiveInfo = actionData.correctiveInfo;
          // Status IDP_UZMAN_GORUSU'na geçecek (API'de otomatik)
          break;
      }

      // Don't send the entire case data, only the updates
      const updatePayload = Object.keys(updates).reduce((acc: any, key) => {
        if (updates[key] !== undefined && updates[key] !== null) {
          acc[key] = updates[key];
        }
        return acc;
      }, {});
      
      console.log('Sending update payload:', updatePayload);
      await api.updateCase(token!, Number(params.id), updatePayload);
      toast.success('İşlem başarıyla tamamlandı');
      
        fetchCase();
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'İşlem sırasında hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
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

  if (!caseData || !user) {
    return null;
  }

  // Düzenleme yetkisi: IDP_PERSONNEL sadece IDP_FORM durumunda kendi vakasını düzenleyebilir
  const canEdit = user.role === 'ADMIN' || 
    (user.role === 'IDP_PERSONNEL' && caseData.status === 'IDP_FORM' && caseData.createdById === user.id);
  
  // İşlemler sekmesi için erişim kontrolü - her rol kendi işlemlerini yapabilir
  // INSTITUTION_USER sadece kendi kurumuna gönderilen vakalar için erişebilir
  const isInstitutionUserCase = user.role === 'INSTITUTION_USER' && 
    caseData.status === 'KURUM_BEKLENIYOR' &&
    (caseData.targetInstitutionId === user.institutionId || 
     caseData.targetMinistry === user.institution);
  
  const canAccessActions = 
    (user.role === 'ADMIN' && (['IDP_FORM', 'ADMIN_ONAYI_BEKLENIYOR'].includes(caseData.status) || caseData.status === 'TAMAMLANDI')) ||
    (user.role === 'IDP_PERSONNEL' && ['IDP_UZMAN_GORUSU', 'IDP_SON_KONTROL'].includes(caseData.status)) ||
    (user.role === 'LEGAL_PERSONNEL' && caseData.status === 'HUKUK_INCELEMESI') ||
    isInstitutionUserCase;
  const StatusIcon = statusIcons[caseData.status] || FileText;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{caseData.title}</h1>
              <p className="text-default-500">Vaka No: {caseData.caseNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button
                color="primary"
                startContent={<Edit className="w-4 h-4" />}
                onClick={() => router.push(`/cases/${params.id}/edit`)}
              >
                Düzenle
              </Button>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <StatusIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-default-500">Mevcut Durum</p>
              <p className="text-lg font-semibold">{statusLabels[caseData.status]}</p>
            </div>
            <div className="flex gap-2">
              <Chip color={priorityColors[caseData.priority]} variant="dot">
                {priorityLabels[caseData.priority]}
              </Chip>
              <Chip variant="bordered">{caseData.platform}</Chip>
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key: any) => setActiveTab(key as string)}
        >
          <Tab key="details" title="Detaylar">
            <Card className="mt-4">
              <CardBody className="space-y-6">
                {/* Rapor Başlığı */}
                {(caseData.relatedMinistry || caseData.submittedTo || caseData.submittingUnit || caseData.preparedBy) && (
                  <div className="bg-default-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-4">Rapor Başlığı</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {caseData.relatedMinistry && (
                        <div>
                          <p className="text-sm text-default-500">Konu</p>
                          <p className="mt-1 text-sm">{caseData.relatedMinistry}</p>
                        </div>
                      )}
                      {caseData.submittedTo && (
                        <div>
                          <p className="text-sm text-default-500">Sunulan Makam</p>
                          <p className="mt-1 text-sm">{caseData.submittedTo}</p>
                        </div>
                      )}
                      {caseData.submittingUnit && (
                        <div>
                          <p className="text-sm text-default-500">Sunan Birim</p>
                          <p className="mt-1 text-sm">{caseData.submittingUnit}</p>
                        </div>
                      )}
                      {caseData.preparedBy && (
                        <div>
                          <p className="text-sm text-default-500">Hazırlayan</p>
                          <p className="mt-1 text-sm">{caseData.preparedBy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Haber Bilgileri */}
                {(caseData.newsHeadline || caseData.newspaperAuthor || caseData.newsSummary || caseData.sourceUrl) && (
                  <div className="bg-default-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-4">Haber Bilgileri</h3>
                    <div className="space-y-4">
                      {caseData.newsHeadline && (
                        <div>
                          <p className="text-sm text-default-500">Haber Başlığı</p>
                          <p className="mt-1 text-sm">{caseData.newsHeadline}</p>
                        </div>
                      )}
                      {caseData.newspaperAuthor && (
                        <div>
                          <p className="text-sm text-default-500">Gazete, Yazar/Muhabir</p>
                          <p className="mt-1 text-sm">{caseData.newspaperAuthor}</p>
                        </div>
                      )}
                      {caseData.newsSummary && (
                        <div>
                          <p className="text-sm text-default-500">Haber Özeti</p>
                          <p className="mt-1 text-sm whitespace-pre-wrap">{caseData.newsSummary}</p>
                        </div>
                      )}
                      {caseData.sourceUrl && (
                        <div>
                          <p className="text-sm text-default-500">Haber Linki</p>
                          <a 
                            href={caseData.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {caseData.sourceUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Genel Bilgiler */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Genel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Açıklama</p>
                      <p className="mt-1">{caseData.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-default-400" />
                        <span className="text-sm">Coğrafi Kapsam: {caseData.geographicScope}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-default-400" />
                        <span className="text-sm">Kaynak: {caseData.sourceType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bakanlık Bilgilendirme */}
                {caseData.ministryInfo && (
                  <div className="bg-default-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-4">Bakanlık Bilgilendirme</h3>
                    <p className="text-sm whitespace-pre-wrap">{caseData.ministryInfo}</p>
                  </div>
                )}

                {/* Dezenformasyon Türü */}
                {caseData.disinformationType && (
                  <div>
                    <p className="text-sm text-default-500 mb-2">Tespit Edilen Dezenformasyon Türü</p>
                    <Chip variant="flat" color="warning">
                      {disinformationTypeLabels[caseData.disinformationType] || caseData.disinformationType}
                    </Chip>
                  </div>
                )}

                {/* Öneri ve Teklifler */}
                {caseData.recommendation && (
                  <div className="bg-default-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-4">Öneri ve Teklifler</h3>
                    <p className="text-sm whitespace-pre-wrap">{caseData.recommendation}</p>
                  </div>
                )}

                {/* Etiketler */}
                {(() => {
                  const tags = typeof caseData.tags === 'string' ? JSON.parse(caseData.tags) : caseData.tags;
                  return tags && tags.length > 0 && (
                    <div>
                      <p className="text-sm text-default-500 mb-2">Etiketler</p>
                      <div className="flex gap-2 flex-wrap">
                        {tags.map((tag: string, index: number) => (
                          <Chip key={index} size="sm" variant="flat" startContent={<Tag className="w-3 h-3" />}>
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <Divider />

                {/* Değerlendirmeler */}
                {caseData.idpAssessment && (
                  <div>
                    <h4 className="font-semibold mb-2">IDP Değerlendirmesi</h4>
                    <p className="text-sm">{caseData.idpAssessment}</p>
                    {caseData.idpNotes && (
                      <p className="text-sm text-default-500 mt-2">Not: {caseData.idpNotes}</p>
                    )}
                  </div>
                )}

                {caseData.expertEvaluation && (
                  <div>
                    <h4 className="font-semibold mb-2">Uzman Görüşü</h4>
                    <p className="text-sm whitespace-pre-wrap">{caseData.expertEvaluation}</p>
                  </div>
                )}

                {caseData.legalAssessment && (
                  <div>
                    <h4 className="font-semibold mb-2">Hukuki Değerlendirme</h4>
                    <p className="text-sm">{caseData.legalAssessment}</p>
                    {caseData.legalNotes && (
                      <p className="text-sm text-default-500 mt-2">Not: {caseData.legalNotes}</p>
                    )}
                    <Chip 
                      size="sm" 
                      color={caseData.legalApproved ? 'success' : 'danger'}
                      className="mt-2"
                    >
                      {caseData.legalApproved ? 'Onaylandı' : 'Reddedildi'}
                    </Chip>
                  </div>
                )}

                {caseData.institutionResponse && (
                  <div>
                    <h4 className="font-semibold mb-2">Kurum Yanıtı</h4>
                    <p className="text-sm">{caseData.institutionResponse}</p>
                    {caseData.correctiveInfo && (
                      <div className="mt-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                        <p className="text-sm font-medium text-success-700 dark:text-success-300">
                          Düzeltici Bilgi:
                        </p>
                        <p className="text-sm mt-1">{caseData.correctiveInfo}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Son Kontrol */}
                {caseData.finalNotes && (
                  <div>
                    <h4 className="font-semibold mb-2">Son Kontrol Notları</h4>
                    <p className="text-sm whitespace-pre-wrap">{caseData.finalNotes}</p>
                    {caseData.finalApproval && (
                      <Chip size="sm" color="success" className="mt-2">
                        Onaylandı
                      </Chip>
                    )}
                  </div>
                )}

                {/* Öneriler */}
                {caseData.recommendation && (
                  <div className="bg-default-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Öneri ve Teklifler</h4>
                    <p className="text-sm whitespace-pre-wrap">{caseData.recommendation}</p>
                  </div>
                )}

                {/* Rapor Bilgileri */}
                {(caseData.internalReport || caseData.externalReport || caseData.targetMinistry || caseData.targetInstitution) && (
                  <div className="bg-default-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-4">Rapor Bilgileri</h3>
                    <div className="space-y-4">
                      {caseData.targetMinistry && (
                        <div>
                          <p className="text-sm text-default-500 mb-2">Hedef Bakanlık/Kurum</p>
                          <p className="text-sm">{caseData.targetMinistry}</p>
                        </div>
                      )}
                      {caseData.targetInstitution && (
                        <div>
                          <p className="text-sm text-default-500 mb-2">Hedef Kurum</p>
                          <p className="text-sm">{caseData.targetInstitution.name}</p>
                        </div>
                      )}
                      {caseData.internalReport && (
                        <div>
                          <p className="text-sm text-default-500 mb-2">İç Rapor (Makam Notu)</p>
                          <p className="text-sm whitespace-pre-wrap">{caseData.internalReport}</p>
                        </div>
                      )}
                      {caseData.externalReport && (
                        <div>
                          <p className="text-sm text-default-500 mb-2">Dış Rapor (Harici Not)</p>
                          <p className="text-sm whitespace-pre-wrap">{caseData.externalReport}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Kullanıcı Bilgileri */}
                <div>
                  <h4 className="font-semibold mb-3">İlgili Kullanıcılar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <User
                      name={caseData.creator.fullName}
                      description={`Oluşturan • ${format(new Date(caseData.createdAt), 'dd MMM yyyy', { locale: tr })}`}
                      avatarProps={{ name: caseData.creator.fullName.charAt(0) }}
                    />
                    {caseData.legalReviewer && (
                      <User
                        name={caseData.legalReviewer.fullName}
                        description="Hukuk İncelemesi"
                        avatarProps={{ name: caseData.legalReviewer.fullName.charAt(0) }}
                      />
                    )}
                    {caseData.finalReviewer && (
                      <User
                        name={caseData.finalReviewer.fullName}
                        description="Son Kontrol"
                        avatarProps={{ name: caseData.finalReviewer.fullName.charAt(0) }}
                      />
                    )}
                    {caseData.institutionResponder && (
                      <User
                        name={caseData.institutionResponder.fullName}
                        description="Kurum Yanıtı"
                        avatarProps={{ name: caseData.institutionResponder.fullName.charAt(0) }}
                      />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="files" title="Dosyalar">
            <Card className="mt-4">
              <CardBody>
                {caseData.files && caseData.files.length > 0 ? (
                  <div className="space-y-3">
                    {caseData.files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-default-100">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-sm text-default-500">
                              {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.uploadedAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" variant="flat" color="default">
                            {file.uploadedBy?.fullName || 'Bilinmeyen'}
                          </Chip>
                          <Button
                            as="a"
                            href={`/api/files${file.filePath.startsWith('/') ? file.filePath : '/' + file.filePath}`}
                            target="_blank"
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<Download className="w-4 h-4" />}
                          >
                            İndir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-500 py-8">Henüz dosya yüklenmemiş</p>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab key="history" title="Geçmiş">
            <Card className="mt-4">
              <CardBody>
                <div className="space-y-4">
                  {caseData.history.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="p-2 rounded-full bg-default-100">
                          <History className="w-4 h-4" />
                        </div>
                        {index < caseData.history.length - 1 && (
                          <div className="w-0.5 h-16 bg-default-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-default-500">
                          {item.user.fullName} • {format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                        </p>
                        {item.notes && (
                          <p className="text-sm mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="actions" title="İşlemler" isDisabled={!canAccessActions}>
            <Card className="mt-4">
              <CardBody className="space-y-4">
                {/* Admin: IDP_FORM -> KURUM_BEKLENIYOR */}
                {user.role === 'ADMIN' && caseData.status === 'IDP_FORM' && (
                  <Button
                    color="primary"
                    startContent={<Send className="w-4 h-4" />}
                    onClick={() => handleAction('send_to_institution')}
                  >
                    Kurum İncelemesi İçin Gönder
                  </Button>
                )}

                {/* Admin: ADMIN_ONAYI_BEKLENIYOR -> HUKUK_INCELEMESI (Sadece IDP_UZMAN_GORUSU sonrası, yani expertEvaluation varsa ama finalNotes yoksa) */}
                {user.role === 'ADMIN' && 
                 caseData.status === 'ADMIN_ONAYI_BEKLENIYOR' && 
                 caseData.expertEvaluation && 
                 !caseData.finalNotes && (
                  <Button
                    color="primary"
                    startContent={<Gavel className="w-4 h-4" />}
                    onClick={() => handleAction('send_to_legal')}
                  >
                    Hukuk İncelemesi İçin Gönder
                  </Button>
                )}

                {/* Admin: ADMIN_ONAYI_BEKLENIYOR -> TAMAMLANDI (Rapor oluştur ve sonlandır) - Sadece IDP_SON_KONTROL sonrası, yani finalNotes varsa */}
                {user.role === 'ADMIN' && 
                 caseData.status === 'ADMIN_ONAYI_BEKLENIYOR' && 
                 caseData.finalNotes && (
                  <Button
                    color="success"
                    startContent={<FileText className="w-4 h-4" />}
                    onClick={() => handleAction('complete_and_report')}
                  >
                    Sonlandır ve Rapor Oluştur
                  </Button>
                )}

                {/* IDP_PERSONNEL: KURUM_BEKLENIYOR -> IDP_UZMAN_GORUSU (Uzman görüşü ekle) */}
                {user.role === 'IDP_PERSONNEL' && caseData.status === 'IDP_UZMAN_GORUSU' && (
                  <Button
                    color="primary"
                    startContent={<FileText className="w-4 h-4" />}
                    onClick={() => handleAction('add_expert_evaluation')}
                  >
                    Uzman Görüşü Ekle
                  </Button>
                )}

                {/* IDP_PERSONNEL: IDP_SON_KONTROL (Son kontrol notu ve öneri ekle) */}
                {user.role === 'IDP_PERSONNEL' && caseData.status === 'IDP_SON_KONTROL' && (
                  <Button
                    color="primary"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleAction('add_final_control')}
                  >
                    Son Kontrol Notu ve Öneri Ekle
                  </Button>
                )}

                {/* LEGAL_PERSONNEL: HUKUK_INCELEMESI */}
                {user.role === 'LEGAL_PERSONNEL' && caseData.status === 'HUKUK_INCELEMESI' && (
                  <Button
                    color="primary"
                    startContent={<Gavel className="w-4 h-4" />}
                    onClick={() => handleAction('legal_review')}
                  >
                    Hukuki Değerlendirme Yap
                  </Button>
                )}

                {/* INSTITUTION_USER: KURUM_BEKLENIYOR -> IDP_UZMAN_GORUSU */}
                {isInstitutionUserCase && (
                  <Button
                    color="primary"
                    startContent={<Building2 className="w-4 h-4" />}
                    onClick={() => handleAction('institution_response')}
                  >
                    Kurum Yanıtı Ver
                  </Button>
                )}

                {/* Admin: TAMAMLANDI durumunda rapor indir */}
                {user.role === 'ADMIN' && caseData.status === 'TAMAMLANDI' && (
                  <Button
                    color="secondary"
                    startContent={<Download className="w-4 h-4" />}
                    onClick={handleDownloadReport}
                  >
                    Raporu İndir
                  </Button>
                )}
              </CardBody>
            </Card>
          </Tab>
        </Tabs>

        {/* Action Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              {actionType === 'send_to_institution' && 'Kurum İncelemesi İçin Gönder'}
              {actionType === 'send_to_legal' && 'Hukuk İncelemesi İçin Gönder'}
              {actionType === 'add_expert_evaluation' && 'Uzman Görüşü Ekle'}
              {actionType === 'add_final_control' && 'Son Kontrol Notu ve Öneri Ekle'}
              {actionType === 'legal_review' && 'Hukuki Değerlendirme'}
              {actionType === 'complete_and_report' && 'Sonlandır ve Rapor Oluştur'}
              {actionType === 'institution_response' && 'Kurum Yanıtı'}
            </ModalHeader>
            <ModalBody>
              {actionType === 'send_to_institution' && (
                <div className="space-y-4">
                  <p>Bu vakayı kurum incelemesi için göndermek istediğinizden emin misiniz?</p>
                  <Select
                    label="Hedef Kurum"
                    placeholder="Kurum seçiniz"
                    selectedKeys={actionData.targetInstitutionId ? [actionData.targetInstitutionId.toString()] : []}
                    onSelectionChange={(keys: any) => {
                      const selectedId = Array.from(keys)[0];
                      if (selectedId) {
                        const selectedInstitution = institutions.find(inst => inst.id.toString() === selectedId);
                        setActionData({
                          ...actionData,
                          targetInstitutionId: parseInt(selectedId as string),
                          targetMinistry: selectedInstitution?.name || '',
                        });
                      }
                    }}
                    isLoading={isLoadingInstitutions}
                    isRequired
                  >
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              )}

              {actionType === 'send_to_legal' && (
                <p>Bu vakayı hukuk incelemesi için göndermek istediğinizden emin misiniz?</p>
              )}

              {actionType === 'add_expert_evaluation' && (
                <Textarea
                  label="Uzman Görüşü"
                  placeholder="Uzman görüşünüzü yazın"
                  value={actionData.expertEvaluation || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData({...actionData, expertEvaluation: e.target.value})}
                  minRows={5}
                  isRequired
                />
              )}

              {actionType === 'add_final_control' && (
                <div className="space-y-4">
                  <Textarea
                    label="Son Kontrol Notu"
                    placeholder="Son kontrol notlarınızı yazın"
                  value={actionData.finalNotes || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData({...actionData, finalNotes: e.target.value})}
                    minRows={4}
                    isRequired
                  />
                  <Textarea
                    label="Öneri ve Teklifler"
                    placeholder="Öneri ve tekliflerinizi yazın"
                  value={actionData.recommendations || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData({...actionData, recommendations: e.target.value})}
                    minRows={4}
                  />
                </div>
              )}

              {actionType === 'legal_review' && (
                <div className="space-y-4">
                  <Textarea
                    label="Hukuki Değerlendirme"
                    placeholder="Hukuki değerlendirmenizi yazın"
                    value={actionData.assessment || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData({...actionData, assessment: e.target.value})}
                    minRows={4}
                  />
                  <Textarea
                    label="Notlar"
                    placeholder="Ek notlarınız"
                    value={actionData.notes || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData({...actionData, notes: e.target.value})}
                    minRows={3}
                  />
                  <div className="flex gap-4">
                    <Button
                      color="success"
                      onClick={() => setActionData({...actionData, approved: true})}
                      variant={actionData.approved === true ? 'solid' : 'flat'}
                    >
                      Onayla
                    </Button>
                    <Button
                      color="danger"
                      onClick={() => setActionData({...actionData, approved: false})}
                      variant={actionData.approved === false ? 'solid' : 'flat'}
                    >
                      Reddet
                    </Button>
                  </div>
                </div>
              )}

              {actionType === 'complete_and_report' && (
                <div className="space-y-4">
                  <p className="text-sm text-default-500">
                    Vaka tamamlanacak ve rapor indirilebilir olacaktır. Onaylıyor musunuz?
                  </p>
                </div>
              )}

              {actionType === 'institution_response' && (
                <div className="space-y-4">
                  <Textarea
                    label="Kurum Yanıtı"
                    placeholder="Kurumunuzun resmi yanıtını yazın"
                    value={actionData.response || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData({...actionData, response: e.target.value})}
                    minRows={4}
                  />
                  <Textarea
                    label="Düzeltici Bilgi"
                    placeholder="Doğru bilgileri ve kaynakları belirtin"
                    value={actionData.correctiveInfo || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData({...actionData, correctiveInfo: e.target.value})}
                    minRows={4}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={onClose}>
                İptal
              </Button>
              <Button
                color="primary"
                onClick={submitAction}
                isLoading={isSubmitting}
              >
                {actionType === 'complete_and_report' ? 'Onayla' : 'Gönder'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}