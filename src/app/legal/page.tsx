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
  Tooltip
} from '@nextui-org/react';
import { Gavel, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { demoAPI, demoUsers } from '@/lib/demo-data';

interface LegalCase {
  id: number;
  caseNumber: string;
  title: string;
  platform: string;
  priority: string;
  status: string;
  legalApproved?: boolean;
  legalReviewDate?: string;
  creator?: {
    id: number;
    username: string;
    fullName: string;
  };
  legalReviewer?: {
    id: number;
    username: string;
    fullName: string;
  };
  createdAt: string;
  createdById: number;
}

const statusLabels: Record<string, string> = {
  HUKUK_INCELEMESI: 'Hukuk İncelemesi Bekliyor',
  SON_KONTROL: 'Son Kontrol',
  RAPOR_URETIMI: 'Rapor Üretimi',
  KURUM_BEKLENIYOR: 'Kurum Bekleniyor',
  TAMAMLANDI: 'Tamamlandı',
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

export default function LegalPage() {
  const router = useRouter();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const response = await demoAPI.getCases({ limit: 50 });
      const legalCases: LegalCase[] = response.cases.map(caseItem => ({
        ...caseItem,
        createdAt: caseItem.createdAt.toISOString(),
        legalReviewDate: caseItem.legalReviewDate?.toISOString(),
        creator: (() => {
          const creator = demoUsers.find((user: any) => user.id === caseItem.createdById);
          return creator ? {
            id: creator.id,
            username: creator.username,
            fullName: creator.fullName,
          } : undefined;
        })(),
        legalReviewer: (() => {
          if (!caseItem.legalReviewerId) return undefined;
          const reviewer = demoUsers.find((user: any) => user.id === caseItem.legalReviewerId);
          return reviewer ? {
            id: reviewer.id,
            username: reviewer.username,
            fullName: reviewer.fullName,
          } : undefined;
        })(),
      }));
      setCases(legalCases);
      
      // Calculate stats
      const pending = legalCases.filter((c: LegalCase) => c.status === 'HUKUK_INCELEMESI').length;
      const approved = legalCases.filter((c: LegalCase) => c.legalApproved === true).length;
      const rejected = legalCases.filter((c: LegalCase) => c.legalApproved === false).length;
      
      setStats({
        pending,
        approved,
        rejected,
        total: legalCases.length,
      });
    } catch (error) {
      console.error('Failed to fetch legal cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'caseNumber', label: 'VAKA NO' },
    { key: 'title', label: 'BAŞLIK' },
    { key: 'priority', label: 'ÖNCELİK' },
    { key: 'status', label: 'DURUM' },
    { key: 'legalStatus', label: 'HUKUKİ DURUM' },
    { key: 'reviewer', label: 'İNCELEYEN' },
    { key: 'date', label: 'TARİH' },
    { key: 'actions', label: 'İŞLEMLER' },
  ];

  const renderCell = (item: LegalCase, columnKey: string) => {
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
      
      case 'status':
        return (
          <Chip
            size="sm"
            variant="flat"
            color={item.status === 'HUKUK_INCELEMESI' ? 'warning' : 'default'}
          >
            {statusLabels[item.status]}
          </Chip>
        );
      
      case 'legalStatus':
        if (item.status === 'HUKUK_INCELEMESI') {
          return (
            <Chip
              size="sm"
              variant="flat"
              color="warning"
              startContent={<Clock className="w-3 h-3" />}
            >
              Bekliyor
            </Chip>
          );
        } else if (item.legalApproved === true) {
          return (
            <Chip
              size="sm"
              variant="flat"
              color="success"
              startContent={<CheckCircle className="w-3 h-3" />}
            >
              Onaylandı
            </Chip>
          );
        } else if (item.legalApproved === false) {
          return (
            <Chip
              size="sm"
              variant="flat"
              color="danger"
              startContent={<XCircle className="w-3 h-3" />}
            >
              Reddedildi
            </Chip>
          );
        }
        return '-';
      
      case 'reviewer':
        return item.legalReviewer ? (
          <User
            name={item.legalReviewer.fullName}
            description={item.legalReviewer.username}
            avatarProps={{
              size: 'sm',
              name: item.legalReviewer.fullName.charAt(0),
            }}
          />
        ) : (
          <span className="text-default-400">-</span>
        );
      
      case 'date':
        return (
          <div className="text-sm">
            <p>{format(new Date(item.createdAt), 'dd MMM yyyy', { locale: tr })}</p>
            {item.legalReviewDate && (
              <p className="text-xs text-default-400">
                İnceleme: {format(new Date(item.legalReviewDate), 'dd MMM', { locale: tr })}
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
            {item.status === 'HUKUK_INCELEMESI' && (
              <Tooltip content="İncele">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="primary"
                  onClick={() => router.push(`/cases/${item.id}?tab=actions`)}
                >
                  <Gavel className="w-4 h-4" />
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
    <DashboardLayout allowedRoles={['ADMIN', 'LEGAL_PERSONNEL']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hukuki İncelemeler</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Toplam</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Gavel className="w-8 h-8 text-default-300" />
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Bekleyen</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-warning-300" />
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Onaylanan</p>
                  <p className="text-2xl font-bold text-success">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-300" />
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Reddedilen</p>
                  <p className="text-2xl font-bold text-danger">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-danger-300" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table aria-label="Hukuki incelemeler tablosu">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={cases}
              emptyContent="Hukuki inceleme bekleyen vaka bulunamadı"
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
      </div>
    </DashboardLayout>
  );
}