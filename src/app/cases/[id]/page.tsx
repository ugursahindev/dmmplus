'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { demoAPI } from '@/lib/demo-data';

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
  legalAssessment?: string;
  legalNotes?: string;
  legalApproved?: boolean;
  finalNotes?: string;
  finalApproval?: boolean;
  internalReport?: string;
  externalReport?: string;
  targetMinistry?: string;
  institutionResponse?: string;
  correctiveInfo?: string;
  
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
  HUKUK_INCELEMESI: 'Hukuk İncelemesi',
  SON_KONTROL: 'Son Kontrol',
  RAPOR_URETIMI: 'Rapor Üretimi',
  KURUM_BEKLENIYOR: 'Kurum Bekleniyor',
  TAMAMLANDI: 'Tamamlandı',
};

const statusIcons: Record<string, any> = {
  IDP_FORM: FileText,
  HUKUK_INCELEMESI: Gavel,
  SON_KONTROL: CheckCircle,
  RAPOR_URETIMI: FileText,
  KURUM_BEKLENIYOR: Building2,
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

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [params.id]);

  const fetchCase = async () => {
    try {
      const caseData = await demoAPI.getCase(Number(params.id));
      // Convert Case to CaseDetail format
      const caseDetail: CaseDetail = {
        ...caseData,
        createdAt: caseData.createdAt.toISOString(),
        updatedAt: caseData.updatedAt.toISOString(),
        creator: { id: caseData.createdById, fullName: 'Demo User', username: 'demo' },
        files: [],
        history: [],
        legalReviewer: caseData.legalReviewerId ? { id: caseData.legalReviewerId, fullName: 'Legal User', username: 'legal' } : undefined,
        finalReviewer: caseData.finalReviewerId ? { id: caseData.finalReviewerId, fullName: 'Final User', username: 'final' } : undefined,
        institutionResponder: caseData.institutionResponderId ? { id: caseData.institutionResponderId, fullName: 'Institution User', username: 'institution' } : undefined,
      };
      setCaseData(caseDetail);
    } catch (error) {
      console.error('Failed to fetch case:', error);
      toast.error('Vaka yüklenirken hata oluştu');
      router.push('/cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (type: string) => {
    setActionType(type);
    setActionData({});
    onOpen();
  };

  const submitAction = async () => {
    if (!caseData) return;

    setIsSubmitting(true);
    try {
      let updates: any = { ...actionData };

      switch (actionType) {
        case 'send_to_legal':
          updates.status = 'HUKUK_INCELEMESI';
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
          updates.status = 'SON_KONTROL';
          updates.legalAssessment = actionData.assessment;
          updates.legalNotes = actionData.notes;
          updates.legalApproved = actionData.approved;
          break;
        case 'final_control':
          updates.status = 'RAPOR_URETIMI';
          updates.finalNotes = actionData.notes;
          updates.finalApproval = true;
          break;
        case 'generate_report':
          updates.status = 'KURUM_BEKLENIYOR';
          updates.internalReport = actionData.internalReport;
          updates.externalReport = actionData.externalReport;
          updates.targetMinistry = actionData.targetMinistry;
          updates.reportGeneratedDate = new Date().toISOString();
          break;
        case 'institution_response':
          updates.status = 'TAMAMLANDI';
          updates.institutionResponse = actionData.response;
          updates.correctiveInfo = actionData.correctiveInfo;
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
      await demoAPI.updateCase(Number(params.id), updatePayload);
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

  const canEdit = user.role === 'ADMIN' || user.role === 'IDP_PERSONNEL';
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
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab key="details" title="Detaylar">
            <Card className="mt-4">
              <CardBody className="space-y-6">
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
                      {caseData.sourceUrl && (
                        <a 
                          href={caseData.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Kaynak URL'yi Görüntüle
                        </a>
                      )}
                    </div>
                  </div>
                </div>

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

          <Tab key="actions" title="İşlemler" isDisabled={!canEdit}>
            <Card className="mt-4">
              <CardBody className="space-y-4">
                {user.role === 'IDP_PERSONNEL' && caseData.status === 'IDP_FORM' && (
                  <Button
                    color="primary"
                    startContent={<Send className="w-4 h-4" />}
                    onClick={() => handleAction('send_to_legal')}
                  >
                    Hukuki İncelemeye Gönder
                  </Button>
                )}

                {user.role === 'LEGAL_PERSONNEL' && caseData.status === 'HUKUK_INCELEMESI' && (
                  <Button
                    color="primary"
                    startContent={<Gavel className="w-4 h-4" />}
                    onClick={() => handleAction('legal_review')}
                  >
                    Hukuki Değerlendirme Yap
                  </Button>
                )}

                {user.role === 'IDP_PERSONNEL' && caseData.status === 'SON_KONTROL' && (
                  <Button
                    color="primary"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleAction('final_control')}
                  >
                    Son Kontrolü Tamamla
                  </Button>
                )}

                {user.role === 'IDP_PERSONNEL' && caseData.status === 'RAPOR_URETIMI' && (
                  <Button
                    color="primary"
                    startContent={<FileText className="w-4 h-4" />}
                    onClick={() => handleAction('generate_report')}
                  >
                    Rapor Oluştur
                  </Button>
                )}

                {user.role === 'INSTITUTION_USER' && caseData.status === 'KURUM_BEKLENIYOR' && (
                  <Button
                    color="primary"
                    startContent={<Building2 className="w-4 h-4" />}
                    onClick={() => handleAction('institution_response')}
                  >
                    Kurum Yanıtı Ver
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
              {actionType === 'send_to_legal' && 'Hukuki İncelemeye Gönder'}
              {actionType === 'legal_review' && 'Hukuki Değerlendirme'}
              {actionType === 'final_control' && 'Son Kontrol'}
              {actionType === 'generate_report' && 'Rapor Oluştur'}
              {actionType === 'institution_response' && 'Kurum Yanıtı'}
            </ModalHeader>
            <ModalBody>
              {actionType === 'send_to_legal' && (
                <p>Bu vakayı hukuki incelemeye göndermek istediğinizden emin misiniz?</p>
              )}

              {actionType === 'legal_review' && (
                <div className="space-y-4">
                  <Textarea
                    label="Hukuki Değerlendirme"
                    placeholder="Hukuki değerlendirmenizi yazın"
                    value={actionData.assessment || ''}
                    onChange={(e) => setActionData({...actionData, assessment: e.target.value})}
                    minRows={4}
                  />
                  <Textarea
                    label="Notlar"
                    placeholder="Ek notlarınız"
                    value={actionData.notes || ''}
                    onChange={(e) => setActionData({...actionData, notes: e.target.value})}
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

              {actionType === 'final_control' && (
                <Textarea
                  label="Son Kontrol Notları"
                  placeholder="Son kontrol notlarınızı yazın"
                  value={actionData.notes || ''}
                  onChange={(e) => setActionData({...actionData, notes: e.target.value})}
                  minRows={4}
                />
              )}

              {actionType === 'generate_report' && (
                <div className="space-y-4">
                  <Textarea
                    label="İç Rapor (Makam Notu)"
                    placeholder="Kurum içi kullanım için rapor"
                    value={actionData.internalReport || ''}
                    onChange={(e) => setActionData({...actionData, internalReport: e.target.value})}
                    minRows={5}
                  />
                  <Textarea
                    label="Dış Rapor (Harici Not)"
                    placeholder="Bakanlıklara gönderilecek rapor"
                    value={actionData.externalReport || ''}
                    onChange={(e) => setActionData({...actionData, externalReport: e.target.value})}
                    minRows={5}
                  />
                  <Input
                    label="Hedef Bakanlık"
                    placeholder="Örn: Milli Eğitim Bakanlığı"
                    value={actionData.targetMinistry || ''}
                    onChange={(e) => setActionData({...actionData, targetMinistry: e.target.value})}
                  />
                </div>
              )}

              {actionType === 'institution_response' && (
                <div className="space-y-4">
                  <Textarea
                    label="Kurum Yanıtı"
                    placeholder="Kurumunuzun resmi yanıtını yazın"
                    value={actionData.response || ''}
                    onChange={(e) => setActionData({...actionData, response: e.target.value})}
                    minRows={4}
                  />
                  <Textarea
                    label="Düzeltici Bilgi"
                    placeholder="Doğru bilgileri ve kaynakları belirtin"
                    value={actionData.correctiveInfo || ''}
                    onChange={(e) => setActionData({...actionData, correctiveInfo: e.target.value})}
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
                Gönder
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}