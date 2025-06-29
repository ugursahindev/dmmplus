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
  User
} from '@nextui-org/react';
import { Plus, Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Case {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  platform: string;
  priority: string;
  status: string;
  tags: string[];
  sourceUrl?: string;
  createdAt: string;
  creator: {
    id: number;
    username: string;
    fullName: string;
  };
  files: Array<{
    id: number;
    fileName: string;
    fileType: string;
  }>;
}

const statusLabels: Record<string, string> = {
  IDP_FORM: 'IDP Formu',
  HUKUK_INCELEMESI: 'Hukuk İncelemesi',
  SON_KONTROL: 'Son Kontrol',
  RAPOR_URETIMI: 'Rapor Üretimi',
  KURUM_BEKLENIYOR: 'Kurum Bekleniyor',
  TAMAMLANDI: 'Tamamlandı',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  CRITICAL: 'Kritik',
};

const platformLabels: Record<string, string> = {
  TWITTER: 'Twitter',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  WHATSAPP: 'WhatsApp',
  TELEGRAM: 'Telegram',
  TIKTOK: 'TikTok',
  OTHER: 'Diğer',
};

const priorityColors: Record<string, 'default' | 'primary' | 'warning' | 'danger'> = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  IDP_FORM: 'default',
  HUKUK_INCELEMESI: 'primary',
  SON_KONTROL: 'secondary',
  RAPOR_URETIMI: 'warning',
  KURUM_BEKLENIYOR: 'warning',
  TAMAMLANDI: 'success',
};

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchCases();
  }, [page, search, statusFilter, priorityFilter]);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await axiosInstance.get(`/api/cases?${params}`);
      if (response.data.success) {
        setCases(response.data.data.cases);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      toast.error('Vakalar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu vakayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/cases/${id}`);
      if (response.data.success) {
        toast.success('Vaka başarıyla silindi');
        fetchCases();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Vaka silinirken hata oluştu');
    }
  };

  const columns = [
    { key: 'caseNumber', label: 'VAKA NO' },
    { key: 'title', label: 'BAŞLIK' },
    { key: 'platform', label: 'PLATFORM' },
    { key: 'status', label: 'DURUM' },
    { key: 'priority', label: 'ÖNCELİK' },
    { key: 'creator', label: 'OLUŞTURAN' },
    { key: 'createdAt', label: 'TARİH' },
    { key: 'actions', label: 'İŞLEMLER' },
  ];

  const renderCell = (item: Case, columnKey: string) => {
    switch (columnKey) {
      case 'caseNumber':
        return <span className="font-mono text-sm">{item.caseNumber}</span>;
      
      case 'title':
        return (
          <div className="max-w-xs">
            <p className="font-medium truncate">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {(() => {
                const tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
                return tags && tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {tags.slice(0, 2).map((tag: string, index: number) => (
                      <Chip key={index} size="sm" variant="flat">
                        {tag}
                      </Chip>
                  ))}
                  {tags.length > 2 && (
                    <Chip size="sm" variant="flat">
                      +{tags.length - 2}
                    </Chip>
                  )}
                </div>
              );
            })()}
            {item.files && item.files.length > 0 && (
              <Chip size="sm" variant="flat" color="primary" className="ml-2">
                📎 {item.files.length}
              </Chip>
            )}
            </div>
          </div>
        );
      
      case 'platform':
        return <Chip size="sm" variant="bordered">{platformLabels[item.platform]}</Chip>;
      
      case 'status':
        return (
          <Chip
            size="sm"
            color={statusColors[item.status]}
            variant="flat"
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
      
      case 'creator':
        return (
          <User
            name={item.creator.fullName}
            description={item.creator.username}
            avatarProps={{
              size: 'sm',
              name: item.creator.fullName.charAt(0),
            }}
          />
        );
      
      case 'createdAt':
        return (
          <span className="text-sm text-default-500">
            {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: tr })}
          </span>
        );
      
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Görüntüle">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => router.push(`/cases/${item.id}`)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Düzenle">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => router.push(`/cases/${item.id}/edit`)}
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
                onClick={() => handleDelete(item.id)}
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
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vakalar</h1>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/cases/new')}
          >
            Yeni Vaka
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Input
            className="max-w-xs"
            placeholder="Vaka ara..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="max-w-xs"
            placeholder="Durum filtrele"
            startContent={<Filter className="w-4 h-4 text-default-400" />}
            selectedKeys={statusFilter ? [statusFilter] : []}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectItem key="all" value="">Tümü</SelectItem>
            <SelectItem key="OPEN" value="OPEN">Açık</SelectItem>
            <SelectItem key="UNDER_REVIEW" value="UNDER_REVIEW">İnceleniyor</SelectItem>
            <SelectItem key="VERIFIED" value="VERIFIED">Doğrulandı</SelectItem>
            <SelectItem key="FALSE_POSITIVE" value="FALSE_POSITIVE">Yanlış Pozitif</SelectItem>
            <SelectItem key="CLOSED" value="CLOSED">Kapalı</SelectItem>
          </Select>
          <Select
            className="max-w-xs"
            placeholder="Öncelik filtrele"
            startContent={<Filter className="w-4 h-4 text-default-400" />}
            selectedKeys={priorityFilter ? [priorityFilter] : []}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <SelectItem key="all" value="">Tümü</SelectItem>
            <SelectItem key="LOW" value="LOW">Düşük</SelectItem>
            <SelectItem key="MEDIUM" value="MEDIUM">Orta</SelectItem>
            <SelectItem key="HIGH" value="HIGH">Yüksek</SelectItem>
            <SelectItem key="CRITICAL" value="CRITICAL">Kritik</SelectItem>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <Table aria-label="Vakalar tablosu">
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key}>
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody
                items={cases}
                emptyContent="Vaka bulunamadı"
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
            
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}