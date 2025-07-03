'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from '@nextui-org/react';
import { FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/cases/StatsCard';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface Stats {
  summary: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  recentCases: Array<{
    id: number;
    caseNumber: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const data = await api.getStats(token);
      setStats({
        summary: data.summary,
        recentCases: data.recentCases
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Toplam Vaka"
                value={stats.summary.total}
                icon={<FileText className="w-6 h-6" />}
                color="primary"
              />
              <StatsCard
                title="Bekleyen"
                value={stats.summary.pending}
                icon={<Clock className="w-6 h-6" />}
                color="warning"
              />
              <StatsCard
                title="İşlemde"
                value={stats.summary.inProgress}
                icon={<TrendingUp className="w-6 h-6" />}
                color="secondary"
              />
              <StatsCard
                title="Tamamlanan"
                value={stats.summary.completed}
                icon={<CheckCircle className="w-6 h-6" />}
                color="success"
              />
            </div>

            {/* Recent Cases */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Son Vakalar</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Son vakalar tablosu">
                  <TableHeader>
                    <TableColumn>VAKA NO</TableColumn>
                    <TableColumn>BAŞLIK</TableColumn>
                    <TableColumn>DURUM</TableColumn>
                    <TableColumn>ÖNCELİK</TableColumn>
                    <TableColumn>TARİH</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {stats.recentCases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-mono text-sm">
                          {caseItem.caseNumber}
                        </TableCell>
                        <TableCell>{caseItem.title}</TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={statusColors[caseItem.status]}
                            variant="flat"
                          >
                            {statusLabels[caseItem.status]}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={priorityColors[caseItem.priority]}
                            variant="dot"
                          >
                            {caseItem.priority.toUpperCase()}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {format(new Date(caseItem.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-default-500">İstatistikler yüklenemedi</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}