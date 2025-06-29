'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Divider,
  Badge,
} from '@nextui-org/react';
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  };
  assignedBy: {
    id: number;
    fullName: string;
    username: string;
  };
  case: {
    id: number;
    caseNumber: string;
    title: string;
  } | null;
  _count: {
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'assignedToMe' | 'createdByMe'>('assignedToMe');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, viewMode]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (viewMode === 'assignedToMe') params.append('assignedToMe', 'true');
      if (viewMode === 'createdByMe') params.append('createdByMe', 'true');

      const response = await axiosInstance.get(`/api/tasks?${params.toString()}`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Görevler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await axiosInstance.patch(`/api/tasks/${taskId}`, { status: newStatus });
      toast.success('Görev durumu güncellendi');
      fetchTasks();
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description.toLowerCase().includes(search.toLowerCase()) ||
    task.assignedTo.fullName.toLowerCase().includes(search.toLowerCase())
  );

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

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && status !== 'COMPLETED';
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Görev Yönetimi</h1>
            <p className="text-default-500">İş ve görev takibi</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => router.push('/tasks/new')}
            >
              Yeni Görev
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'assignedToMe' ? 'solid' : 'flat'}
                  color={viewMode === 'assignedToMe' ? 'primary' : 'default'}
                  onPress={() => setViewMode('assignedToMe')}
                >
                  Bana Atanan
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'createdByMe' ? 'solid' : 'flat'}
                  color={viewMode === 'createdByMe' ? 'primary' : 'default'}
                  onPress={() => setViewMode('createdByMe')}
                >
                  Atadıklarım
                </Button>
                {user?.role === 'ADMIN' && (
                  <Button
                    size="sm"
                    variant={viewMode === 'all' ? 'solid' : 'flat'}
                    color={viewMode === 'all' ? 'primary' : 'default'}
                    onPress={() => setViewMode('all')}
                  >
                    Tüm Görevler
                  </Button>
                )}
              </div>
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Görev ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  startContent={<Search className="w-4 h-4 text-default-400" />}
                  className="w-64"
                />
                <Select
                  placeholder="Durum"
                  selectedKeys={[statusFilter]}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                  startContent={<Filter className="w-4 h-4" />}
                >
                  <SelectItem key="all" value="all">Tümü</SelectItem>
                  <SelectItem key="PENDING" value="PENDING">Bekliyor</SelectItem>
                  <SelectItem key="IN_PROGRESS" value="IN_PROGRESS">Devam Ediyor</SelectItem>
                  <SelectItem key="COMPLETED" value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem key="CANCELLED" value="CANCELLED">İptal</SelectItem>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table aria-label="Görevler tablosu">
              <TableHeader>
                <TableColumn>GÖREV</TableColumn>
                <TableColumn>ATAYAN</TableColumn>
                <TableColumn>ATANAN</TableColumn>
                <TableColumn>ÖNCELİK</TableColumn>
                <TableColumn>DURUM</TableColumn>
                <TableColumn>TERMİN</TableColumn>
                <TableColumn>İŞLEMLER</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Görev bulunamadı" items={filteredTasks}>
                {(task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-default-500 line-clamp-1">
                          {task.description}
                        </p>
                        {task._count.comments > 0 && (
                          <div className="flex items-center gap-1 text-xs text-default-400">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task._count.comments} yorum</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <User
                        name={task.assignedBy.fullName}
                        description={task.assignedBy.username}
                        avatarProps={{
                          name: task.assignedBy.fullName,
                          size: "sm"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <User
                        name={task.assignedTo.fullName}
                        description={task.assignedTo.username}
                        avatarProps={{
                          name: task.assignedTo.fullName,
                          size: "sm"
                        }}
                      />
                    </TableCell>
                    <TableCell>{getPriorityIcon(task.priority)}</TableCell>
                    <TableCell>{getStatusIcon(task.status)}</TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className={`text-sm ${isOverdue(task.dueDate, task.status) ? 'text-danger' : ''}`}>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: tr })}
                          </div>
                          {isOverdue(task.dueDate, task.status) && (
                            <span className="text-xs">Gecikmiş</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleViewTask(task)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {task.assignedTo.id === user?.id && task.status !== 'COMPLETED' && (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              {task.status === 'PENDING' ? (
                                <DropdownItem
                                  key="start"
                                  onPress={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                                >
                                  İşleme Al
                                </DropdownItem>
                              ) : null}
                              {task.status === 'IN_PROGRESS' ? (
                                <DropdownItem
                                  key="complete"
                                  onPress={() => router.push(`/tasks/${task.id}/complete`)}
                                >
                                  Tamamla
                                </DropdownItem>
                              ) : null}
                              <DropdownItem
                                key="cancel"
                                className="text-danger"
                                color="danger"
                                onPress={() => handleStatusUpdate(task.id, 'CANCELLED')}
                              >
                                İptal Et
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* View Task Modal */}
        <Modal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)}
          size="2xl"
        >
          <ModalContent>
            {(onClose) => selectedTask && (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedTask.title}
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-default-500 mb-1">Açıklama</p>
                      <p>{selectedTask.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500 mb-1">Öncelik</p>
                        {getPriorityIcon(selectedTask.priority)}
                      </div>
                      <div>
                        <p className="text-sm text-default-500 mb-1">Durum</p>
                        {getStatusIcon(selectedTask.status)}
                      </div>
                    </div>

                    {selectedTask.feedback && (
                      <div>
                        <p className="text-sm text-default-500 mb-1">Geri Bildirim</p>
                        <Card className="bg-success-50">
                          <CardBody>
                            <p className="text-sm">{selectedTask.feedback}</p>
                          </CardBody>
                        </Card>
                      </div>
                    )}

                    {selectedTask.case && (
                      <div>
                        <p className="text-sm text-default-500 mb-1">İlgili Vaka</p>
                        <Card className="bg-default-50">
                          <CardBody>
                            <p className="font-medium">{selectedTask.case.caseNumber}</p>
                            <p className="text-sm text-default-600">{selectedTask.case.title}</p>
                          </CardBody>
                        </Card>
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={onClose}>
                    Kapat
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={() => {
                      onClose();
                      router.push(`/tasks/${selectedTask.id}`);
                    }}
                  >
                    Detaya Git
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