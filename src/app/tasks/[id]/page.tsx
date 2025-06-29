'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  User,
  Divider,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Badge,
  Tooltip,
} from '@nextui-org/react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
  Edit,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const priorityConfig = {
  LOW: { label: 'Düşük', color: 'success' as const },
  MEDIUM: { label: 'Orta', color: 'warning' as const },
  HIGH: { label: 'Yüksek', color: 'danger' as const },
  CRITICAL: { label: 'Kritik', color: 'danger' as const, variant: 'flat' as const }
};

const statusConfig = {
  PENDING: { label: 'Bekliyor', color: 'warning' as const, icon: Clock },
  IN_PROGRESS: { label: 'Devam Ediyor', color: 'primary' as const, icon: AlertCircle },
  COMPLETED: { label: 'Tamamlandı', color: 'success' as const, icon: CheckCircle },
  CANCELLED: { label: 'İptal Edildi', color: 'danger' as const, icon: XCircle }
};

interface TaskComment {
  id: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    username: string;
    role: string;
  };
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  feedback: string | null;
  assignedTo: {
    id: number;
    fullName: string;
    username: string;
    role: string;
    email: string;
  };
  assignedBy: {
    id: number;
    fullName: string;
    username: string;
    email: string;
  };
  case: {
    id: number;
    caseNumber: string;
    title: string;
  } | null;
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [completionFeedback, setCompletionFeedback] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [taskId, setTaskId] = useState<string>('');

  useEffect(() => {
    const loadTask = async () => {
      const { id } = await params;
      fetchTask(id);
    };
    loadTask();
  }, [params]);

  const fetchTask = async (taskId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/tasks/${taskId}`);
      setTask(response.data.task);
    } catch (error: any) {
      console.error('Error fetching task:', error);
      if (error.response?.status === 404) {
        toast.error('Görev bulunamadı');
        router.push('/tasks');
      } else if (error.response?.status === 403) {
        toast.error('Bu görevi görüntüleme yetkiniz yok');
        router.push('/tasks');
      } else {
        toast.error('Görev yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!task) return;

    setUpdatingStatus(true);
    try {
      const data: any = { status: newStatus };
      
      // If completing the task and there's feedback
      if (newStatus === 'COMPLETED' && completionFeedback) {
        data.feedback = completionFeedback;
      }

      await axiosInstance.patch(`/api/tasks/${task.id}`, data);
      toast.success('Görev durumu güncellendi');
      const { id } = await params;
      fetchTask(id);
      onClose();
      setCompletionFeedback('');
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !task) return;

    setSubmittingComment(true);
    try {
      await axiosInstance.post(`/api/tasks/${task.id}/comments`, {
        comment: newComment
      });
      toast.success('Yorum eklendi');
      setNewComment('');
      fetchTask(taskId);
    } catch (error) {
      toast.error('Yorum eklenirken hata oluştu');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL']}>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL']}>
        <div className="text-center py-12">
          <p className="text-default-500">Görev bulunamadı</p>
          <Button color="primary" variant="light" onPress={() => router.push('/tasks')}>
            Görevlere Dön
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isAssignee = task.assignedTo.id === user?.id;
  const isAssigner = task.assignedBy.id === user?.id;
  const isAdmin = user?.role === 'ADMIN';
  const canUpdateStatus = isAssignee && task.status !== 'COMPLETED' && task.status !== 'CANCELLED';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  const getPriorityIcon = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Chip 
        color={config.color} 
        variant={'variant' in config ? config.variant : 'dot'}
        size="sm"
      >
        {config.label}
      </Chip>
    );
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <Chip 
        color={config.color} 
        variant="flat"
        size="sm"
        startContent={<Icon className="w-3 h-3" />}
      >
        {config.label}
      </Chip>
    );
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'ADMIN': 'Yönetici',
      'IDP_PERSONNEL': 'IDP Personeli',
      'LEGAL_PERSONNEL': 'Hukuk Personeli'
    };
    return labels[role] || role;
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL']}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Görev Detayı</h1>
        </div>

        {/* Main Task Card */}
        <Card>
          <CardHeader className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
              <div className="flex flex-wrap gap-2">
                {getPriorityIcon(task.priority)}
                {getStatusIcon(task.status)}
                {isOverdue && (
                  <Chip 
                    color="danger" 
                    variant="flat"
                    size="sm"
                    startContent={<AlertTriangle className="w-3 h-3" />}
                  >
                    Gecikmiş
                  </Chip>
                )}
              </div>
            </div>
            {canUpdateStatus && (
              <div className="flex gap-2">
                {task.status === 'PENDING' && (
                  <Button
                    color="primary"
                    size="sm"
                    onPress={() => handleStatusUpdate('IN_PROGRESS')}
                  >
                    İşleme Al
                  </Button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <>
                    <Button
                      color="success"
                      size="sm"
                      onPress={onOpen}
                    >
                      Tamamla
                    </Button>
                    <Button
                      color="danger"
                      variant="light"
                      size="sm"
                      onPress={() => handleStatusUpdate('CANCELLED')}
                    >
                      İptal Et
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-default-500 mb-2">Açıklama</h3>
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>

            <Divider />

            {/* Task Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-default-500 mb-2">Atayan</h3>
                <User
                  name={task.assignedBy.fullName}
                  description={task.assignedBy.username}
                  avatarProps={{
                    name: task.assignedBy.fullName,
                    size: "sm"
                  }}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-default-500 mb-2">Atanan</h3>
                <User
                  name={task.assignedTo.fullName}
                  description={`${task.assignedTo.username} - ${getRoleLabel(task.assignedTo.role)}`}
                  avatarProps={{
                    name: task.assignedTo.fullName,
                    size: "sm"
                  }}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-default-500 mb-2">Oluşturulma Tarihi</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-default-400" />
                  <span>{format(new Date(task.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-default-500 mb-2">Termin Tarihi</h3>
                {task.dueDate ? (
                  <div className={`flex items-center gap-2 ${isOverdue ? 'text-danger' : ''}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: tr })}</span>
                  </div>
                ) : (
                  <span className="text-default-400">Belirtilmemiş</span>
                )}
              </div>
            </div>

            {/* Related Case */}
            {task.case && (
              <>
                <Divider />
                <div>
                  <h3 className="text-sm font-medium text-default-500 mb-2">İlgili Vaka</h3>
                  <Card className="bg-default-50">
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{task.case.caseNumber}</p>
                          <p className="text-sm text-default-600">{task.case.title}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => router.push(`/cases/${task.case?.id}`)}
                        >
                          Vakaya Git
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </>
            )}

            {/* Feedback */}
            {task.feedback && (
              <>
                <Divider />
                <div>
                  <h3 className="text-sm font-medium text-default-500 mb-2">Tamamlanma Geri Bildirimi</h3>
                  <Card className="bg-success-50">
                    <CardBody>
                      <p className="text-sm">{task.feedback}</p>
                      {task.completedAt && (
                        <p className="text-xs text-default-500 mt-2">
                          {format(new Date(task.completedAt), 'dd MMMM yyyy HH:mm', { locale: tr })} tarihinde tamamlandı
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Yorumlar ({task.comments.length})
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* New Comment Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Yorum yazın..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                minRows={3}
              />
              <div className="flex justify-end">
                <Button
                  color="primary"
                  size="sm"
                  startContent={<Send className="w-4 h-4" />}
                  onPress={handleCommentSubmit}
                  isLoading={submittingComment}
                  isDisabled={!newComment.trim()}
                >
                  Gönder
                </Button>
              </div>
            </div>

            <Divider />

            {/* Comments List */}
            {task.comments.length > 0 ? (
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <Card key={comment.id} className="bg-default-50">
                    <CardBody>
                      <div className="flex justify-between items-start mb-2">
                        <User
                          name={comment.user.fullName}
                          description={`${comment.user.username} - ${getRoleLabel(comment.user.role)}`}
                          avatarProps={{
                            name: comment.user.fullName,
                            size: "sm"
                          }}
                        />
                        <span className="text-xs text-default-400">
                          {format(new Date(comment.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                        </span>
                      </div>
                      <p className="text-sm mt-2">{comment.comment}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-default-400 py-8">Henüz yorum yok</p>
            )}
          </CardBody>
        </Card>

        {/* Complete Task Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Görevi Tamamla</ModalHeader>
                <ModalBody>
                  <p className="text-sm text-default-600 mb-4">
                    Görevi tamamlamak üzeresiniz. Geri bildirim eklemek ister misiniz?
                  </p>
                  <Textarea
                    label="Geri Bildirim (Opsiyonel)"
                    placeholder="Görev hakkında notlarınız, karşılaşılan sorunlar veya öneriler..."
                    value={completionFeedback}
                    onChange={(e) => setCompletionFeedback(e.target.value)}
                    minRows={4}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    İptal
                  </Button>
                  <Button 
                    color="success" 
                    onPress={() => handleStatusUpdate('COMPLETED')}
                    isLoading={updatingStatus}
                  >
                    Tamamla
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}