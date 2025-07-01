'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Select,
  SelectItem,
  Spinner,
  Progress
} from '@nextui-org/react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  Activity, TrendingUp, AlertCircle, CheckCircle, 
  Clock, Users, Calendar, Globe, Zap
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { demoAPI } from '@/lib/demo-data';

interface StatsData {
  summary: {
    total: number;
    pending: number;
    inLegalReview: number;
    completed: number;
    critical: number;
    avgCompletionTime: number;
  };
  byStatus: Array<{ name: string; value: number; color: string }>;
  byPlatform: Array<{ name: string; value: number }>;
  byPriority: Array<{ name: string; value: number; color: string }>;
  dailyTrend: Array<{ date: string; new: number; completed: number }>;
  byGeographicScope: Array<{ name: string; value: number }>;
  topTags: Array<{ tag: string; count: number }>;
  ministryDistribution: Array<{ ministry: string; count: number }>;
  userActivity: Array<{ user: string; cases: number; role: string }>;
}

const statusColors = {
  'IDP Form': '#3b82f6',
  'Hukuk İncelemesi': '#f59e0b',
  'Son Kontrol': '#8b5cf6',
  'Rapor Üretimi': '#06b6d4',
  'Kurum Bekleniyor': '#ec4899',
  'Tamamlandı': '#10b981'
};

const priorityColors = {
  'Düşük': '#6b7280',
  'Orta': '#3b82f6',
  'Yüksek': '#f59e0b',
  'Kritik': '#ef4444'
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const casesRes = await demoAPI.getCases({ limit: 1000 });
      const cases = casesRes.cases;

      // Summary stats
      const summary = {
        total: cases.length,
        pending: cases.filter((c: any) => c.status === 'IDP_FORM').length,
        inLegalReview: cases.filter((c: any) => c.status === 'HUKUK_INCELEMESI').length,
        completed: cases.filter((c: any) => c.status === 'TAMAMLANDI').length,
        critical: cases.filter((c: any) => c.priority === 'CRITICAL').length,
        avgCompletionTime: calculateAvgCompletionTime(cases)
      };

      // By Status
      const statusMap: Record<string, number> = {};
      cases.forEach((c: any) => {
        const status = getStatusLabel(c.status);
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const byStatus = Object.entries(statusMap).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name as keyof typeof statusColors] || '#6b7280'
      }));

      // By Platform
      const platformMap: Record<string, number> = {};
      cases.forEach((c: any) => {
        platformMap[c.platform] = (platformMap[c.platform] || 0) + 1;
      });
      const byPlatform = Object.entries(platformMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7);

      // By Priority
      const priorityMap: Record<string, number> = {};
      cases.forEach((c: any) => {
        const priority = getPriorityLabel(c.priority);
        priorityMap[priority] = (priorityMap[priority] || 0) + 1;
      });
      const byPriority = Object.entries(priorityMap).map(([name, value]) => ({
        name,
        value,
        color: priorityColors[name as keyof typeof priorityColors] || '#6b7280'
      }));

      // Daily trend
      const days = parseInt(dateRange);
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);
      const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
      
      const dailyTrend = dateInterval.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const newCases = cases.filter((c: any) => 
          format(new Date(c.createdAt), 'yyyy-MM-dd') === dateStr
        ).length;
        const completedCases = cases.filter((c: any) => 
          c.status === 'TAMAMLANDI' && 
          c.institutionResponseDate &&
          format(new Date(c.institutionResponseDate), 'yyyy-MM-dd') === dateStr
        ).length;

        return {
          date: format(date, 'dd MMM', { locale: tr }),
          new: newCases,
          completed: completedCases
        };
      });

      // By Geographic Scope
      const geoMap: Record<string, number> = {};
      cases.forEach((c: any) => {
        const scope = getGeoLabel(c.geographicScope);
        geoMap[scope] = (geoMap[scope] || 0) + 1;
      });
      const byGeographicScope = Object.entries(geoMap)
        .map(([name, value]) => ({ name, value }));

      // Top Tags
      const tagMap: Record<string, number> = {};
      cases.forEach((c: any) => {
        const tagsData = c.tags || [];
        const tags = typeof tagsData === 'string' ? JSON.parse(tagsData) : tagsData;
        if (Array.isArray(tags)) {
          tags.forEach((tag: string) => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        }
      });
      const topTags = Object.entries(tagMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Ministry Distribution
      const ministryMap: Record<string, number> = {};
      cases.forEach((c: any) => {
        if (c.targetMinistry) {
          ministryMap[c.targetMinistry] = (ministryMap[c.targetMinistry] || 0) + 1;
        }
      });
      const ministryDistribution = Object.entries(ministryMap)
        .map(([ministry, count]) => ({ ministry, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // User Activity
      const userMap: Record<string, { cases: number; role: string }> = {};
      cases.forEach((c: any) => {
        const userName = c.creator.fullName;
        if (!userMap[userName]) {
          userMap[userName] = { cases: 0, role: c.creator.role };
        }
        userMap[userName].cases++;
      });
      const userActivity = Object.entries(userMap)
        .map(([user, data]) => ({ user, ...data }))
        .sort((a, b) => b.cases - a.cases)
        .slice(0, 5);

      setStats({
        summary,
        byStatus,
        byPlatform,
        byPriority,
        dailyTrend,
        byGeographicScope,
        topTags,
        ministryDistribution,
        userActivity
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAvgCompletionTime = (cases: any[]) => {
    const completedCases = cases.filter(c => 
      c.status === 'TAMAMLANDI' && c.institutionResponseDate
    );
    
    if (completedCases.length === 0) return 0;

    const totalHours = completedCases.reduce((sum, c) => {
      const created = new Date(c.createdAt);
      const completed = new Date(c.institutionResponseDate);
      const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return Math.round(totalHours / completedCases.length);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      IDP_FORM: 'IDP Form',
      HUKUK_INCELEMESI: 'Hukuk İncelemesi',
      SON_KONTROL: 'Son Kontrol',
      RAPOR_URETIMI: 'Rapor Üretimi',
      KURUM_BEKLENIYOR: 'Kurum Bekleniyor',
      TAMAMLANDI: 'Tamamlandı'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Düşük',
      MEDIUM: 'Orta',
      HIGH: 'Yüksek',
      CRITICAL: 'Kritik'
    };
    return labels[priority] || priority;
  };

  const getGeoLabel = (scope: string) => {
    const labels: Record<string, string> = {
      LOCAL: 'Yerel',
      REGIONAL: 'Bölgesel',
      NATIONAL: 'Ulusal',
      INTERNATIONAL: 'Uluslararası'
    };
    return labels[scope] || scope;
  };

  if (isLoading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">İstatistikler</h1>
          <Select
            label="Zaman Aralığı"
            className="w-48"
            selectedKeys={[dateRange]}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <SelectItem key="7">Son 7 Gün</SelectItem>
            <SelectItem key="30">Son 30 Gün</SelectItem>
            <SelectItem key="90">Son 90 Gün</SelectItem>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Toplam Vaka</p>
                  <p className="text-2xl font-bold">{stats.summary.total}</p>
                </div>
                <Activity className="w-8 h-8 text-primary-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Bekleyen</p>
                  <p className="text-2xl font-bold text-warning">{stats.summary.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-warning-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Hukuk İnceleme</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.summary.inLegalReview}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Tamamlanan</p>
                  <p className="text-2xl font-bold text-success">{stats.summary.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Kritik</p>
                  <p className="text-2xl font-bold text-danger">{stats.summary.critical}</p>
                </div>
                <Zap className="w-8 h-8 text-danger-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Ort. Süre</p>
                  <p className="text-2xl font-bold">{stats.summary.avgCompletionTime}s</p>
                </div>
                <TrendingUp className="w-8 h-8 text-default-300" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Durum Dağılımı</h3>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Öncelik Dağılımı</h3>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byPriority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {stats.byPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Platform Dağılımı</h3>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byPlatform} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Daily Trend Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Günlük Vaka Trendi</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="new" 
                    name="Yeni Vakalar"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    name="Tamamlanan"
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Coğrafi Kapsam</h3>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byGeographicScope}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.byGeographicScope.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Ministry Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Bakanlık Dağılımı</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {stats.ministryDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{item.ministry}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                    <Progress 
                      value={(item.count / stats.summary.total) * 100} 
                      color="primary"
                      size="sm"
                    />
                  </div>
                ))}
                {stats.ministryDistribution.length === 0 && (
                  <p className="text-default-400 text-center py-8">
                    Henüz bakanlığa iletilen vaka bulunmuyor
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tags */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">En Çok Kullanılan Etiketler</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {stats.topTags.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Chip size="sm" variant="flat">
                      {item.tag}
                    </Chip>
                    <span className="text-sm text-default-500">{item.count} vaka</span>
                  </div>
                ))}
                {stats.topTags.length === 0 && (
                  <p className="text-default-400 text-center py-8">
                    Henüz etiket bulunmuyor
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">En Aktif Kullanıcılar</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {stats.userActivity.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium">{user.user}</p>
                        <p className="text-xs text-default-400">{getRoleLabel(user.role)}</p>
                      </div>
                    </div>
                    <Chip size="sm" variant="flat">
                      {user.cases} vaka
                    </Chip>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: 'Yönetici',
    IDP_PERSONNEL: 'İDP Personeli',
    LEGAL_PERSONNEL: 'Hukuk Personeli',
    INSTITUTION_USER: 'Kurum Kullanıcısı'
  };
  return labels[role] || role;
}