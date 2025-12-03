import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

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

    // Kullanıcı rolüne göre filtreleme koşullarını belirle
    let statusFilter: string[] = [];
    
    switch (currentUser.role) {
      case 'LEGAL_PERSONNEL':
        statusFilter = ['HUKUK_INCELEMESI', 'TAMAMLANDI'];
        break;
      case 'INSTITUTION_USER':
        statusFilter = ['KURUM_BEKLENIYOR', 'TAMAMLANDI'];
        break;
      case 'IDP_PERSONNEL':
        statusFilter = ['IDP_FORM', 'IDP_UZMAN_GORUSU', 'IDP_SON_KONTROL', 'ADMIN_ONAYI_BEKLENIYOR', 'TAMAMLANDI'];
        break;
      default:
        // ADMIN için tüm durumlar
        statusFilter = ['IDP_FORM', 'ADMIN_ONAYI_BEKLENIYOR', 'KURUM_BEKLENIYOR', 'IDP_UZMAN_GORUSU', 'HUKUK_INCELEMESI', 'IDP_SON_KONTROL', 'TAMAMLANDI'];
        break;
    }

    // Temel where koşulu
    const baseWhere = {
      status: {
        in: statusFilter
      }
    };

    // 1. Toplam vaka sayısı
    const totalCases = await prisma.case.count({ where: baseWhere });

    // 2. Duruma göre vaka sayıları
    const byStatus = await prisma.case.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: {
        status: true
      }
    });

    // 3. Önceliğe göre vaka sayıları
    const byPriority = await prisma.case.groupBy({
      by: ['priority'],
      where: baseWhere,
      _count: {
        priority: true
      }
    });

    // 4. Platforma göre vaka sayıları
    const byPlatform = await prisma.case.groupBy({
      by: ['platform'],
      where: baseWhere,
      _count: {
        platform: true
      }
    });

    // 5. Özel metrikler
    const pendingCases = await prisma.case.count({
      where: {
        ...baseWhere,
        status: 'IDP_FORM'
      }
    });

    const inProgressCases = await prisma.case.count({
      where: {
        ...baseWhere,
        status: {
          in: ['ADMIN_ONAYI_BEKLENIYOR', 'KURUM_BEKLENIYOR', 'IDP_UZMAN_GORUSU', 'HUKUK_INCELEMESI', 'IDP_SON_KONTROL']
        }
      }
    });

    const completedCases = await prisma.case.count({
      where: {
        ...baseWhere,
        status: 'TAMAMLANDI'
      }
    });

    // 6. Son 5 vaka
    const recentCases = await prisma.case.findMany({
      where: baseWhere,
      select: {
        id: true,
        caseNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // 7. Kullanıcı aktivitesi - En çok vaka oluşturan kullanıcılar
    const userActivity = await prisma.case.groupBy({
      by: ['createdById'],
      where: baseWhere,
      _count: {
        createdById: true
      },
      orderBy: {
        _count: {
          createdById: 'desc'
        }
      },
      take: 5
    });

    // Kullanıcı detaylarını al
    const userIds = userActivity.map(item => item.createdById);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        fullName: true,
        role: true
      }
    });

    const userActivityWithDetails = userActivity.map(item => {
      const user = users.find(u => u.id === item.createdById);
      return {
        user: user?.fullName || 'Bilinmeyen Kullanıcı',
        cases: item._count.createdById,
        role: user?.role || 'UNKNOWN'
      };
    });

    // 8. Coğrafi kapsam dağılımı
    const byGeographicScope = await prisma.case.groupBy({
      by: ['geographicScope'],
      where: baseWhere,
      _count: {
        geographicScope: true
      }
    });

    // 9. Etiket dağılımı - Tüm vakaların etiketlerini topla
    const allCases = await prisma.case.findMany({
      where: baseWhere,
      select: {
        tags: true
      }
    });

    const tagMap: Record<string, number> = {};
    allCases.forEach(case_ => {
      try {
        const tags = typeof case_.tags === 'string' ? JSON.parse(case_.tags) : case_.tags;
        if (Array.isArray(tags)) {
          tags.forEach((tag: string) => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        }
      } catch (error) {
        // JSON parse hatası durumunda atla
      }
    });

    const topTags = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 10. Bakanlık dağılımı
    const byMinistry = await prisma.case.groupBy({
      by: ['targetMinistry'],
      where: {
        ...baseWhere,
        targetMinistry: {
          not: null
        }
      },
      _count: {
        targetMinistry: true
      },
      orderBy: {
        _count: {
          targetMinistry: 'desc'
        }
      },
      take: 5
    });

    // Verileri formatla
    const formattedByStatus = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const formattedByPriority = byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count.priority;
      return acc;
    }, {} as Record<string, number>);

    const formattedByPlatform = byPlatform.reduce((acc, item) => {
      acc[item.platform] = item._count.platform;
      return acc;
    }, {} as Record<string, number>);

    // Coğrafi kapsam formatla
    const formattedByGeographicScope = byGeographicScope.map(item => ({
      name: item.geographicScope,
      value: item._count.geographicScope
    }));

    // Bakanlık formatla
    const formattedByMinistry = byMinistry.map(item => ({
      ministry: item.targetMinistry || 'Belirtilmemiş',
      count: item._count.targetMinistry
    }));

    // Yanıt formatı
    const response = {
      summary: {
        total: totalCases,
        pending: pendingCases,
        inProgress: inProgressCases,
        completed: completedCases
      },
      byStatus: formattedByStatus,
      byPriority: formattedByPriority,
      byPlatform: formattedByPlatform,
      recentCases: recentCases.map(case_ => ({
        id: case_.id,
        caseNumber: case_.caseNumber,
        title: case_.title,
        status: case_.status,
        priority: case_.priority,
        createdAt: case_.createdAt
      })),
      userActivity: userActivityWithDetails,
      byGeographicScope: formattedByGeographicScope,
      topTags: topTags,
      ministryDistribution: formattedByMinistry
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 