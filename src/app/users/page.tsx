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
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

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
  
  idp_personnel: 'İDP Personeli',
  legal_personnel: 'Hukuk Personeli',
  institution_user: 'Kurum Kullanıcısı',

  default: 'Bilinmeyen Rol', // Fallback label
};

const roleIcons: Record<string, any> = {
  ADMIN: Shield,
  IDP_PERSONNEL: FileSearch,
  LEGAL_PERSONNEL: Gavel,
  INSTITUTION_USER: Building2,
  default: Shield, // Fallback icon
};

const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  ADMIN: 'danger',
  IDP_PERSONNEL: 'primary',
  LEGAL_PERSONNEL: 'warning',
  INSTITUTION_USER: 'secondary',
  default: 'default', // Fallback color
};

export default function UsersPage() {
  const { token } = useAuth();
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
    if (token && token.trim()) {
      fetchUsers();
    }
  }, [token]);

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
    if (!token || !token.trim()) {
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // API'den gelen veriyi UserData formatına dönüştür
        const formattedUsers = (data.users || []).map((user: any) => ({
          ...user,
          role: user.role || 'default', // Fallback role
          _count: user._count || {
            createdCases: 0,
            legalReviewedCases: 0,
            finalReviewedCases: 0,
            institutionResponses: 0,
          }
        }));
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Kullanıcılar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !token.trim()) {
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }
    
    // Form validasyonu
    if (!formData.username || !formData.email || !formData.fullName || !formData.password || !formData.role) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    // Kurum kullanıcısı için kurum alanı zorunlu
    if (formData.role === 'INSTITUTION_USER' && !formData.institution?.trim()) {
      toast.error('Kurum kullanıcısı için kurum alanı zorunludur');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Kullanıcı başarıyla oluşturuldu');
        fetchUsers();
        onCreateClose();
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Kullanıcı oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Create user error:', error);
      toast.error('Kullanıcı oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!token || !token.trim()) {
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }
    
    if (!selectedUser || !selectedUser.id) return;
    
    // Form validasyonu
    if (!formData.username || !formData.email || !formData.fullName || !formData.role) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    // Kurum kullanıcısı için kurum alanı zorunlu
    if (formData.role === 'INSTITUTION_USER' && !formData.institution?.trim()) {
      toast.error('Kurum kullanıcısı için kurum alanı zorunludur');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        toast.success('Kullanıcı başarıyla güncellendi');
        fetchUsers();
        onEditClose();
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Kullanıcı güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Kullanıcı güncellenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !token.trim()) {
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }
    
    if (!selectedUser || !selectedUser.id) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast.success('Kullanıcı başarıyla silindi');
        fetchUsers();
        onDeleteClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Kullanıcı silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: UserData) => {
    if (user && user.id) {
      setSelectedUser(user);
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        role: user.role || 'IDP_PERSONNEL',
        institution: user.institution || '',
        active: user.active !== undefined ? user.active : true,
      });
      onEditOpen();
    }
  };

  const openDeleteModal = (user: UserData) => {
    if (user && user.id) {
      setSelectedUser(user);
      onDeleteOpen();
    }
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
    const count = user._count || {};
    return (
      (count.createdCases || 0) +
      (count.legalReviewedCases || 0) +
      (count.finalReviewedCases || 0) +
      (count.institutionResponses || 0)
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
            name={item.fullName || 'İsimsiz Kullanıcı'}
            description={`@${item.username || 'kullanici'} • ${item.email || 'email@example.com'}`}
            avatarProps={{
              name: (item.fullName || 'K').charAt(0),
              color: roleColors[item.role] || roleColors.default,
            }}
          />
        );

      case 'role':
        const RoleIcon = roleIcons[item.role] || roleIcons.default;
        const roleColor = roleColors[item.role] || roleColors.default;
        const roleLabel = roleLabels[item.role] || roleLabels.default;
        return (
          <Chip
            startContent={<RoleIcon className="w-3 h-3" />}
            color={roleColor}
            variant="flat"
            size="sm"
          >
            {roleLabel}
          </Chip>
        );

      case 'institution':
        return item.institution && item.institution.trim() ? (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-default-400" />
            <span className="text-sm">{item.institution}</span>
          </div>
        ) : (
          <span className="text-default-400">-</span>
        );

      case 'cases':
        const total = getTotalCases(item);
        const count = item._count || {};
        return (
          <div className="text-sm">
            <p className="font-medium">{total} toplam</p>
            <p className="text-xs text-default-400">
              {count.createdCases > 0 && `${count.createdCases} oluşturdu`}
              {count.legalReviewedCases > 0 && `, ${count.legalReviewedCases} inceledi`}
            </p>
          </div>
        );

      case 'status':
        const isActive = item.active !== undefined ? item.active : true;
        return (
          <Chip
            size="sm"
            variant="dot"
            color={isActive ? 'success' : 'danger'}
            startContent={isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          >
            {isActive ? 'Aktif' : 'Pasif'}
          </Chip>
        );

      case 'date':
        try {
          return (
            <span className="text-sm">
              {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: tr })}
            </span>
          );
        } catch (error) {
          return (
            <span className="text-sm text-default-400">
              Tarih belirtilmemiş
            </span>
          );
        }

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Düzenle">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => openEditModal(item)}
                isDisabled={!item.id}
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
                isDisabled={!item.id}
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