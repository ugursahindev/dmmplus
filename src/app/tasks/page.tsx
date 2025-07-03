'use client';

import { useEffect, useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner,
  Tooltip,
  User,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure
} from '@nextui-org/react';
import { Plus, Search, Eye, Edit, Trash2, Filter, Calendar, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/cases/StatsCard';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Task, TaskStats, CreateTaskData, UpdateTaskData } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor',
  IN_PROGRESS: 'İşlemde',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal Edildi',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  CRITICAL: 'Kritik',
};

const priorityColors: Record<string, 'default' | 'primary' | 'warning' | 'danger'> = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'default',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function TasksPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [assignedByFilter, setAssignedByFilter] = useState('');
  const [caseIdFilter, setCaseIdFilter] = useState('');
  
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  
  // Form states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: 0,
    caseId: undefined,
    dueDate: '',
  });

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchStats();
    }
  }, [page, search, statusFilter, priorityFilter, assignedToFilter, assignedByFilter, caseIdFilter, token]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      const response = await api.getTasks(
        token!,
        page,
        10,
        search || undefined,
        statusFilter || undefined,
        priorityFilter || undefined,
        assignedToFilter || undefined,
        assignedByFilter || undefined,
        caseIdFilter || undefined
      );
      
      setTasks(response.tasks);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      toast.error(error.message || 'Görevler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await api.getTaskStats(token!);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch task stats:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      await api.createTask(token!, formData);
      toast.success('Görev başarıyla oluşturuldu');
      onCreateClose();
      resetForm();
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Görev oluşturulurken hata oluştu');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    
    try {
      await api.updateTask(token!, selectedTask.id, formData);
      toast.success('Görev başarıyla güncellendi');
      onEditClose();
      resetForm();
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Görev güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.deleteTask(token!, id);
      toast.success('Görev başarıyla silindi');
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Görev silinirken hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedToId: 0,
      caseId: undefined,
      dueDate: '',
    });
    setSelectedTask(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedToId: task.assignedToId,
      caseId: task.caseId,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    });
    onEditOpen();
  };

  const openViewModal = (task: Task) => {
    setSelectedTask(task);
    onViewOpen();
  };

  const columns = [
    { key: 'title', label: 'BAŞLIK' },
    { key: 'assignedTo', label: 'ATANAN' },
    { key: 'assignedBy', label: 'ATAYAN' },
    { key: 'status', label: 'DURUM' },
    { key: 'priority', label: 'ÖNCELİK' },
    { key: 'dueDate', label: 'SON TARİH' },
    { key: 'case', label: 'VAKA' },
    { key: 'actions', label: 'İŞLEMLER' },
  ];

  const renderCell = (item: Task, columnKey: string) => {
    switch (columnKey) {
      case 'title':
        return (
          <div className="max-w-xs">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-sm text-default-500 truncate">{item.description}</p>
            {item._count.comments > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs text-default-400">{item._count.comments}</span>
              </div>
            )}
          </div>
        );
      
      case 'assignedTo':
        return (
          <User
            name={item.assignedTo.fullName}
            description={item.assignedTo.username}
            avatarProps={{ radius: "lg", src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.assignedTo.username}` }}
          />
        );
      
      case 'assignedBy':
        return (
          <User
            name={item.assignedBy.fullName}
            description={item.assignedBy.username}
            avatarProps={{ radius: "lg", src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.assignedBy.username}` }}
          />
        );
      
      case 'status':
        return (
          <Chip
            size="sm"
            color={statusColors[item.status]}
            variant="flat"
            startContent={
              item.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3" /> :
              item.status === 'IN_PROGRESS' ? <Clock className="w-3 h-3" /> :
              <AlertCircle className="w-3 h-3" />
            }
          >
            {statusLabels[item.status]}
          </Chip>
        );
      
      case 'priority':
        return (
          <Chip
            size="sm"
            color={priorityColors[item.priority]}
            variant="dot"
          >
            {priorityLabels[item.priority]}
          </Chip>
        );
      
      case 'dueDate':
        return item.dueDate ? (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="text-sm">
              {format(new Date(item.dueDate), 'dd MMM yyyy', { locale: tr })}
            </span>
          </div>
        ) : (
          <span className="text-sm text-default-400">Belirtilmemiş</span>
        );
      
      case 'case':
        return item.case ? (
          <Tooltip content={item.case.title}>
            <Chip size="sm" variant="bordered" className="cursor-pointer">
              {item.case.caseNumber}
            </Chip>
          </Tooltip>
        ) : (
          <span className="text-sm text-default-400">Vaka yok</span>
        );
      
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Görüntüle">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => openViewModal(item)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Düzenle">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => openEditModal(item)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Sil" color="danger">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => handleDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL', 'INSTITUTION_USER']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Görevler</h1>
          {['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL'].includes(user?.role || '') && (
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={onCreateOpen}
            >
              Yeni Görev
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Toplam Görev"
              value={stats.overview.totalTasks}
              icon={<Clock className="w-6 h-6" />}
              color="primary"
            />
            <StatsCard
              title="Son 30 Günde"
              value={stats.overview.recentTasks}
              icon={<Calendar className="w-6 h-6" />}
              color="secondary"
            />
            <StatsCard
              title="Tamamlanan"
              value={stats.overview.recentCompletedTasks}
              icon={<CheckCircle className="w-6 h-6" />}
              color="success"
            />
            <StatsCard
              title="Geciken"
              value={stats.overview.overdueTasks}
              icon={<AlertCircle className="w-6 h-6" />}
              color="danger"
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Input
                placeholder="Görev ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startContent={<Search className="w-4 h-4" />}
                size="sm"
              />
              <Select
                placeholder="Durum"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="sm"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                placeholder="Öncelik"
                selectedKeys={priorityFilter ? [priorityFilter] : []}
                onChange={(e) => setPriorityFilter(e.target.value)}
                size="sm"
              >
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </Select>
              <Input
                placeholder="Atanan ID"
                value={assignedToFilter}
                onChange={(e) => setAssignedToFilter(e.target.value)}
                size="sm"
              />
              <Input
                placeholder="Atayan ID"
                value={assignedByFilter}
                onChange={(e) => setAssignedByFilter(e.target.value)}
                size="sm"
              />
              <Input
                placeholder="Vaka ID"
                value={caseIdFilter}
                onChange={(e) => setCaseIdFilter(e.target.value)}
                size="sm"
              />
            </div>
          </CardBody>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <Table aria-label="Görevler tablosu">
                  <TableHeader columns={columns}>
                    {(column) => (
                      <TableColumn key={column.key}>
                        {column.label}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={tasks}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex justify-center mt-4">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    showShadow
                  />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
        <ModalContent>
          <ModalHeader>Yeni Görev Oluştur</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Başlık"
                placeholder="Görev başlığı"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Textarea
                label="Açıklama"
                placeholder="Görev açıklaması"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isRequired
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Öncelik"
                  selectedKeys={[formData.priority]}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {Object.entries(priorityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Atanan Kullanıcı ID"
                  type="number"
                  placeholder="Kullanıcı ID"
                  value={formData.assignedToId.toString()}
                  onChange={(e) => setFormData({ ...formData, assignedToId: parseInt(e.target.value) })}
                  isRequired
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Vaka ID (Opsiyonel)"
                  type="number"
                  placeholder="Vaka ID"
                  value={formData.caseId?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <Input
                  label="Son Tarih"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCreateClose}>
              İptal
            </Button>
            <Button color="primary" onPress={handleCreateTask}>
              Oluştur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <ModalHeader>Görev Düzenle</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Başlık"
                placeholder="Görev başlığı"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Textarea
                label="Açıklama"
                placeholder="Görev açıklaması"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isRequired
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Öncelik"
                  selectedKeys={[formData.priority]}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {Object.entries(priorityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Atanan Kullanıcı ID"
                  type="number"
                  placeholder="Kullanıcı ID"
                  value={formData.assignedToId.toString()}
                  onChange={(e) => setFormData({ ...formData, assignedToId: parseInt(e.target.value) })}
                  isRequired
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Vaka ID (Opsiyonel)"
                  type="number"
                  placeholder="Vaka ID"
                  value={formData.caseId?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <Input
                  label="Son Tarih"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEditClose}>
              İptal
            </Button>
            <Button color="primary" onPress={handleUpdateTask}>
              Güncelle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Task Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          <ModalHeader>Görev Detayları</ModalHeader>
          <ModalBody>
            {selectedTask && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                  <p className="text-default-500 mt-2">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-default-600">Durum</p>
                    <Chip
                      size="sm"
                      color={statusColors[selectedTask.status]}
                      variant="flat"
                    >
                      {statusLabels[selectedTask.status]}
                    </Chip>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-default-600">Öncelik</p>
                    <Chip
                      size="sm"
                      color={priorityColors[selectedTask.priority]}
                      variant="dot"
                    >
                      {priorityLabels[selectedTask.priority]}
                    </Chip>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-default-600">Atanan</p>
                    <User
                      name={selectedTask.assignedTo.fullName}
                      description={selectedTask.assignedTo.username}
                      avatarProps={{ radius: "lg", src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTask.assignedTo.username}` }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-default-600">Atayan</p>
                    <User
                      name={selectedTask.assignedBy.fullName}
                      description={selectedTask.assignedBy.username}
                      avatarProps={{ radius: "lg", src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTask.assignedBy.username}` }}
                    />
                  </div>
                </div>

                {selectedTask.case && (
                  <div>
                    <p className="text-sm font-medium text-default-600">İlgili Vaka</p>
                    <Chip size="sm" variant="bordered">
                      {selectedTask.case.caseNumber} - {selectedTask.case.title}
                    </Chip>
                  </div>
                )}

                {selectedTask.dueDate && (
                  <div>
                    <p className="text-sm font-medium text-default-600">Son Tarih</p>
                    <p className="text-sm">
                      {format(new Date(selectedTask.dueDate), 'dd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                )}

                {selectedTask.feedback && (
                  <div>
                    <p className="text-sm font-medium text-default-600">Geri Bildirim</p>
                    <p className="text-sm">{selectedTask.feedback}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-default-600">Oluşturulma</p>
                    <p className="text-sm">
                      {format(new Date(selectedTask.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-default-600">Son Güncelleme</p>
                    <p className="text-sm">
                      {format(new Date(selectedTask.updatedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </div>

                {selectedTask.completedAt && (
                  <div>
                    <p className="text-sm font-medium text-default-600">Tamamlanma Tarihi</p>
                    <p className="text-sm">
                      {format(new Date(selectedTask.completedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onViewClose}>
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
} 