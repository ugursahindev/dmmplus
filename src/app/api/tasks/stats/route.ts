import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

// Task istatistikleri getirme
export async function GET(request: NextRequest) {
  try {
    // Authorization header'ı kontrol et
    const authorization = request.headers.get('authorization') || undefined;
    const token = authUtils.extractTokenFromHeader(authorization);

    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    const payload = authUtils.verifyToken(token);

    // Kullanıcıyı veritabanından getir ve rolünü kontrol et
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        active: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    if (!currentUser.active) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil' },
        { status: 401 }
      );
    }

    // Filtreleme koşullarını oluştur
    const where: any = {};

    // Kullanıcı rolüne göre filtreleme
    if (currentUser.role === 'INSTITUTION_USER') {
      // Kurum kullanıcıları sadece kendilerine atanan task'ları görebilir
      where.assignedToId = currentUser.id;
    }

    // Toplam task sayısı
    const totalTasks = await prisma.task.count({ where });

    // Durum bazında task sayıları
    const statusStats = await prisma.task.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true,
      },
    });

    // Öncelik bazında task sayıları
    const priorityStats = await prisma.task.groupBy({
      by: ['priority'],
      where,
      _count: {
        priority: true,
      },
    });

    // Kullanıcı bazında atanan task'lar (sadece admin ve yöneticiler için)
    let userStats = null;
    if (['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL'].includes(currentUser.role)) {
      userStats = await prisma.task.groupBy({
        by: ['assignedToId'],
        where,
        _count: {
          assignedToId: true,
        },
      });

      // Kullanıcı bilgilerini ekle
      const userIds = userStats.map(stat => stat.assignedToId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      });

      userStats = userStats.map(stat => ({
        ...stat,
        user: users.find(user => user.id === stat.assignedToId),
      }));
    }

    // Son 30 günde oluşturulan task'lar
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTasks = await prisma.task.count({
      where: {
        ...where,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Son 30 günde tamamlanan task'lar
    const recentCompletedTasks = await prisma.task.count({
      where: {
        ...where,
        completedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Ortalama tamamlanma süresi (gün cinsinden)
    const completedTasks = await prisma.task.findMany({
      where: {
        ...where,
        completedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        completedAt: true,
      },
    });

    let averageCompletionDays = 0;
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt);
        const completed = new Date(task.completedAt!);
        const diffTime = Math.abs(completed.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      averageCompletionDays = Math.round(totalDays / completedTasks.length);
    }

    // Geciken task'lar (dueDate geçmiş ve status COMPLETED değil)
    const overdueTasks = await prisma.task.count({
      where: {
        ...where,
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: 'COMPLETED',
        },
      },
    });

    // Bu hafta tamamlanacak task'lar
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const dueThisWeek = await prisma.task.count({
      where: {
        ...where,
        dueDate: {
          gte: new Date(),
          lte: endOfWeek,
        },
        status: {
          not: 'COMPLETED',
        },
      },
    });

    // İstatistikleri formatla
    const formattedStatusStats = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    const formattedPriorityStats = priorityStats.reduce((acc, stat) => {
      acc[stat.priority] = stat._count.priority;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      overview: {
        totalTasks,
        recentTasks,
        recentCompletedTasks,
        overdueTasks,
        dueThisWeek,
        averageCompletionDays,
      },
      statusDistribution: formattedStatusStats,
      priorityDistribution: formattedPriorityStats,
      userDistribution: userStats,
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 