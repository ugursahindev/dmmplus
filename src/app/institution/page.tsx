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
  CardHeader,
  Spinner,
  User,
  Tooltip,
  Badge
} from '@nextui-org/react';
import { Building2, Eye, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface InstitutionCase {
  id: number;
  caseNumber: string;
  title: string;
  platform: string;
  priority: string;
  status: string;
  targetMinistry?: string;
  reportGeneratedDate?: string;
  institutionResponse?: string;
  institutionResponseDate?: string;
  creator: {
    id: number;
    username: string;
    fullName: string;
  };
  institutionResponder?: {
    id: number;
    username: string;
    fullName: string;
  };
  createdAt: string;
}

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

export default function InstitutionPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [cases, setCases] = useState<InstitutionCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    responded: 0,
    total: 0,
  });

  useEffect(() => {
    if (token) {
      fetchCases();
    }
  }, [token]);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/cases?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Vakalar yüklenemedi');
      }

      const data = await response.json();
      const institutionCases = data.cases || [];
      
      // For institution users, filter by their ministry and show only relevant statuses
      const filteredCases = user?.role === 'INSTITUTION_USER' && user?.institution
        ? institutionCases.filter((c: InstitutionCase) => 
            c.targetMinistry === user.institution && 
            ['KURUM_BEKLENIYOR', 'TAMAMLANDI'].includes(c.status)
          )
        : institutionCases.filter((c: InstitutionCase) => 
            ['KURUM_BEKLENIYOR', 'TAMAMLANDI'].includes(c.status)
          );
      
      setCases(filteredCases);
      
      // Calculate stats
      const pending = filteredCases.filter((c: InstitutionCase) => !c.institutionResponse).length;
      const responded = filteredCases.filter((c: InstitutionCase) => c.institutionResponse).length;
      
      setStats({
        pending,
        responded,
        total: filteredCases.length,
      });
    } catch (error) {
      console.error('Failed to fetch institution cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'caseNumber', label: 'VAKA NO' },
    { key: 'title', label: 'BAŞLIK' },
    { key: 'priority', label: 'ÖNCELİK' },
    { key: 'ministry', label: 'BAKANLIK' },
    { key: 'responseStatus', label: 'YANIT DURUMU' },
    { key: 'date', label: 'TARİH' },
    { key: 'actions', label: 'İŞLEMLER' },
  ];

  const renderCell = (item: InstitutionCase, columnKey: string) => {
    switch (columnKey) {
      case 'caseNumber':
        return <span className="font-mono text-sm">{item.caseNumber}</span>;
      
      case 'title':
        return (
          <div className="max-w-xs">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-xs text-default-400">{item.platform}</p>
          </div>
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
      
      case 'ministry':
        return (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-default-400" />
            <span className="text-sm">{item.targetMinistry || '-'}</span>
          </div>
        );
      
      case 'responseStatus':
        return item.institutionResponse ? (
          <Chip
            size="sm"
            variant="flat"
            color="success"
            startContent={<CheckCircle className="w-3 h-3" />}
          >
            Yanıtlandı
          </Chip>
        ) : (
          <Chip
            size="sm"
            variant="flat"
            color="warning"
            startContent={<Clock className="w-3 h-3" />}
          >
            Yanıt Bekleniyor
          </Chip>
        );
      
      case 'date':
        return (
          <div className="text-sm">
            <p>Rapor: {item.reportGeneratedDate ? format(new Date(item.reportGeneratedDate), 'dd MMM yyyy', { locale: tr }) : '-'}</p>
            {item.institutionResponseDate && (
              <p className="text-xs text-success-600">
                Yanıt: {format(new Date(item.institutionResponseDate), 'dd MMM', { locale: tr })}
              </p>
            )}
          </div>
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
            {!item.institutionResponse && user?.role === 'INSTITUTION_USER' && (
              <Tooltip content="Yanıtla">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="primary"
                  onClick={() => router.push(`/cases/${item.id}?tab=actions`)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'INSTITUTION_USER']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Kurum Yanıtları</h1>
            {user?.institution && (
              <p className="text-default-500">{user.institution}</p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Toplam Vaka</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Building2 className="w-8 h-8 text-default-300" />
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Yanıt Bekleyen</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Badge content={stats.pending} color="warning" size="sm">
                  <Clock className="w-8 h-8 text-warning-300" />
                </Badge>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Yanıtlanan</p>
                  <p className="text-2xl font-bold text-success">{stats.responded}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-300" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Info Card for Institution Users */}
        {user?.role === 'INSTITUTION_USER' && stats.pending > 0 && (
          <Card className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning-600" />
                <h3 className="text-lg font-semibold text-warning-700 dark:text-warning-300">
                  Yanıt Bekleyen Vakalar
                </h3>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <p className="text-sm text-warning-600 dark:text-warning-400">
                {stats.pending} adet vaka için kurumunuzdan yanıt beklenmektedir. 
                Lütfen vakaları inceleyerek gerekli düzeltici bilgileri sağlayın.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : cases.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Building2 className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500">
                {user?.role === 'INSTITUTION_USER' 
                  ? 'Kurumunuza yönlendirilmiş vaka bulunmamaktadır.'
                  : 'Kurum yanıtı bekleyen vaka bulunmamaktadır.'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <Table aria-label="Kurum yanıtları tablosu">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={cases}>
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
      </div>
    </DashboardLayout>
  );
}