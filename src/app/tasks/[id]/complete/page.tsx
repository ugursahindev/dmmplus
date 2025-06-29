'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Textarea,
  Chip,
} from '@nextui-org/react';
import { ArrowLeft, CheckCircle, Save } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: {
    id: number;
    fullName: string;
  };
}

export default function CompleteTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      const taskData = response.data.task;
      
      // Check if user is the assignee
      if (taskData.assignedTo.id !== user?.id) {
        toast.error('Bu görevi sadece atanan kişi tamamlayabilir');
        router.push('/tasks');
        return;
      }

      // Check if task is in progress
      if (taskData.status !== 'IN_PROGRESS') {
        toast.error('Sadece devam eden görevler tamamlanabilir');
        router.push(`/tasks/${taskId}`);
        return;
      }

      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Görev yüklenirken hata oluştu');
      router.push('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;

    setSubmitting(true);
    try {
      await axiosInstance.patch(`/api/tasks/${task.id}`, {
        status: 'COMPLETED',
        feedback: feedback.trim() || null
      });

      toast.success('Görev başarıyla tamamlandı');
      const { id } = await params;
      router.push(`/tasks/${id}`);
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Görev tamamlanırken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['IDP_PERSONNEL', 'LEGAL_PERSONNEL']}>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return null;
  }

  const priorityConfig = {
    LOW: { label: 'Düşük', color: 'success' as const },
    MEDIUM: { label: 'Orta', color: 'warning' as const },
    HIGH: { label: 'Yüksek', color: 'danger' as const },
    CRITICAL: { label: 'Kritik', color: 'danger' as const }
  };

  const config = priorityConfig[task.priority as keyof typeof priorityConfig];

  return (
    <DashboardLayout allowedRoles={['IDP_PERSONNEL', 'LEGAL_PERSONNEL']}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Görevi Tamamla</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-2">{task.title}</h2>
              <Chip 
                color={config.color} 
                variant="dot"
                size="sm"
              >
                {config.label} Öncelik
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-default-500 mb-2">Görev Açıklaması</h3>
              <p className="text-default-700">{task.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-default-500 mb-2">
                Tamamlama Geri Bildirimi
              </h3>
              <Textarea
                placeholder="Görev hakkında notlarınız, karşılaşılan sorunlar, öneriler veya yapılan işlemler hakkında bilgi verin..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                minRows={5}
                className="mb-2"
              />
              <p className="text-xs text-default-400">
                Bu geri bildirim, görevi atayan kişi tarafından görüntülenebilecektir.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="light"
                onPress={() => router.back()}
                isDisabled={submitting}
              >
                İptal
              </Button>
              <Button
                color="success"
                startContent={<CheckCircle className="w-4 h-4" />}
                onPress={handleComplete}
                isLoading={submitting}
              >
                Görevi Tamamla
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}