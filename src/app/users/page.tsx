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
  Card,
  CardBody,
  Spinner,
  User,
  Tooltip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Switch,
} from '@nextui-org/react';
import { 
  Search, UserPlus, Edit, Trash2, Shield, 
  Building2, Gavel, FileSearch, CheckCircle, XCircle 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  institution?: string;
  active: boolean;
  createdAt: string;
  _count: {
    createdCases: number;
    legalReviewedCases: number;
    finalReviewedCases: number;
    institutionResponses: number;
  };
}

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  password?: string;
  role: string;
  institution?: string;
  active: boolean;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Yönetici',
  IDP_PERSONNEL: 'İDP Personeli',
  LEGAL_PERSONNEL: 'Hukuk Personeli',
  INSTITUTION_USER: 'Kurum Kullanıcısı',
};

const roleIcons: Record<string, any> = {
  ADMIN: Shield,
  IDP_PERSONNEL: FileSearch,
  LEGAL_PERSONNEL: Gavel,
  INSTITUTION_USER: Building2,
};

const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  ADMIN: 'danger',
  IDP_PERSONNEL: 'primary',
  LEGAL_PERSONNEL: 'warning',
  INSTITUTION_USER: 'secondary',
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'IDP_PERSONNEL',
    institution: '',
    active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.institution && user.institution.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/api/users');
      if (response.data.success) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/users', formData);
      if (response.data.success) {
        toast.success('Kullanıcı başarıyla oluşturuldu');
        fetchUsers();
        onCreateClose();
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Kullanıcı oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await axiosInstance.put(`/api/users/${selectedUser.id}`, updateData);
      if (response.data.success) {
        toast.success('Kullanıcı başarıyla güncellendi');
        fetchUsers();
        onEditClose();
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Kullanıcı güncellenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.delete(`/api/users/${selectedUser.id}`);
      if (response.data.success) {
        toast.success('Kullanıcı başarıyla silindi');
        fetchUsers();
        onDeleteClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Kullanıcı silinirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      institution: user.institution || '',
      active: user.active,
    });
    onEditOpen();
  };

  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'IDP_PERSONNEL',
      institution: '',
      active: true,
    });
    setSelectedUser(null);
  };

  const getTotalCases = (user: UserData) => {
    return (
      user._count.createdCases +
      user._count.legalReviewedCases +
      user._count.finalReviewedCases +
      user._count.institutionResponses
    );
  };

  const columns = [
    { key: 'user', label: 'KULLANICI' },
    { key: 'role', label: 'ROL' },
    { key: 'institution', label: 'KURUM' },
    { key: 'cases', label: 'İŞLEM SAYISI' },
    { key: 'status', label: 'DURUM' },
    { key: 'date', label: 'KAYIT TARİHİ' },
    { key: 'actions', label: 'İŞLEMLER' },
  ];

  const renderCell = (item: UserData, columnKey: string) => {
    switch (columnKey) {
      case 'user':
        return (
          <User
            name={item.fullName}
            description={`@${item.username} • ${item.email}`}
            avatarProps={{
              name: item.fullName.charAt(0),
              color: roleColors[item.role],
            }}
          />
        );

      case 'role':
        const RoleIcon = roleIcons[item.role];
        return (
          <Chip
            startContent={<RoleIcon className="w-3 h-3" />}
            color={roleColors[item.role]}
            variant="flat"
            size="sm"
          >
            {roleLabels[item.role]}
          </Chip>
        );

      case 'institution':
        return item.institution ? (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-default-400" />
            <span className="text-sm">{item.institution}</span>
          </div>
        ) : (
          <span className="text-default-400">-</span>
        );

      case 'cases':
        const total = getTotalCases(item);
        return (
          <div className="text-sm">
            <p className="font-medium">{total} toplam</p>
            <p className="text-xs text-default-400">
              {item._count.createdCases > 0 && `${item._count.createdCases} oluşturdu`}
              {item._count.legalReviewedCases > 0 && `, ${item._count.legalReviewedCases} inceledi`}
            </p>
          </div>
        );

      case 'status':
        return (
          <Chip
            size="sm"
            variant="dot"
            color={item.active ? 'success' : 'danger'}
            startContent={item.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          >
            {item.active ? 'Aktif' : 'Pasif'}
          </Chip>
        );

      case 'date':
        return (
          <span className="text-sm">
            {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: tr })}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Düzenle">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => openEditModal(item)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Sil">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onClick={() => openDeleteModal(item)}
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
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
          <Button
            color="primary"
            startContent={<UserPlus className="w-4 h-4" />}
            onClick={onCreateOpen}
          >
            Yeni Kullanıcı
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardBody>
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4 text-default-400" />}
              className="max-w-md"
            />
          </CardBody>
        </Card>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table aria-label="Kullanıcılar tablosu">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filteredUsers}
              emptyContent="Kullanıcı bulunamadı"
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey as string)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Create Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
          <ModalContent>
            <ModalHeader>Yeni Kullanıcı Oluştur</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Kullanıcı Adı"
                  placeholder="kullanici_adi"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  isRequired
                />
                <Input
                  label="E-posta"
                  type="email"
                  placeholder="kullanici@dmm.gov.tr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isRequired
                />
                <Input
                  label="Ad Soyad"
                  placeholder="Ad Soyad"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  isRequired
                />
                <Input
                  label="Şifre"
                  type="password"
                  placeholder="Şifre"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  isRequired
                />
                <Select
                  label="Rol"
                  selectedKeys={[formData.role]}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  isRequired
                >
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
                {formData.role === 'INSTITUTION_USER' && (
                  <Input
                    label="Kurum"
                    placeholder="Bakanlık/Kurum adı"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    isRequired
                  />
                )}
                <Switch
                  isSelected={formData.active}
                  onValueChange={(value) => setFormData({ ...formData, active: value })}
                >
                  Aktif Kullanıcı
                </Switch>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={onCreateClose}>
                İptal
              </Button>
              <Button
                color="primary"
                onClick={handleCreate}
                isLoading={isSubmitting}
              >
                Oluştur
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
          <ModalContent>
            <ModalHeader>Kullanıcıyı Düzenle</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Kullanıcı Adı"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  isRequired
                />
                <Input
                  label="E-posta"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isRequired
                />
                <Input
                  label="Ad Soyad"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  isRequired
                />
                <Input
                  label="Yeni Şifre (Opsiyonel)"
                  type="password"
                  placeholder="Boş bırakırsanız değişmez"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Select
                  label="Rol"
                  selectedKeys={[formData.role]}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  isRequired
                >
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
                {formData.role === 'INSTITUTION_USER' && (
                  <Input
                    label="Kurum"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    isRequired
                  />
                )}
                <Switch
                  isSelected={formData.active}
                  onValueChange={(value) => setFormData({ ...formData, active: value })}
                >
                  Aktif Kullanıcı
                </Switch>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={onEditClose}>
                İptal
              </Button>
              <Button
                color="primary"
                onClick={handleUpdate}
                isLoading={isSubmitting}
              >
                Güncelle
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            <ModalHeader>Kullanıcıyı Sil</ModalHeader>
            <ModalBody>
              <p>
                <strong>{selectedUser?.fullName}</strong> kullanıcısını silmek istediğinizden emin misiniz?
              </p>
              <p className="text-sm text-danger mt-2">
                Bu işlem geri alınamaz. Kullanıcının tüm verileri silinecektir.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={onDeleteClose}>
                İptal
              </Button>
              <Button
                color="danger"
                onClick={handleDelete}
                isLoading={isSubmitting}
              >
                Sil
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}