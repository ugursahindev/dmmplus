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

    // Sadece LEGAL_PERSONNEL ve ADMIN rolündeki kullanıcılar erişebilir
    if (!['LEGAL_PERSONNEL', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');
    const platform = searchParams.get('platform');
    const legalStatus = searchParams.get('legalStatus'); // 'pending', 'approved', 'rejected'

    // Sayfalama için offset hesapla
    const offset = (page - 1) * limit;

    // Filtreleme koşullarını oluştur - sadece hukuki inceleme gerektiren vakalar
    const where: any = {
      OR: [
        { status: 'HUKUK_INCELEMESI' },
        { legalReviewerId: { not: null } }, // Hukuki inceleme yapılmış vakalar
      ]
    };

    if (search) {
      where.AND = [{
        OR: [
          { caseNumber: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }];
    }

    if (priority) {
      where.priority = priority;
    }

    if (platform) {
      where.platform = platform;
    }

    // Hukuki durum filtresi
    if (legalStatus) {
      if (legalStatus === 'pending') {
        where.status = 'HUKUK_INCELEMESI';
        where.legalReviewerId = null;
      } else if (legalStatus === 'approved') {
        where.legalApproved = true;
      } else if (legalStatus === 'rejected') {
        where.legalApproved = false;
      }
    }

    // Toplam vaka sayısını al
    const totalCases = await prisma.case.count({ where });

    // Vakaları getir
    const cases = await prisma.case.findMany({
      where,
      select: {
        id: true,
        caseNumber: true,
        title: true,
        description: true,
        platform: true,
        priority: true,
        status: true,
        tags: true,
        geographicScope: true,
        sourceType: true,
        sourceUrl: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        legalAssessment: true,
        legalNotes: true,
        legalApproved: true,
        legalReviewerId: true,
        legalReviewDate: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        legalReviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
          },
        },
        _count: {
          select: {
            files: true,
            tasks: true,
            history: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // HUKUK_INCELEMESI önce
        { createdAt: 'desc' },
        { caseNumber: 'asc' }
      ],
      skip: offset,
      take: limit,
    });

    // Sayfalama bilgilerini hesapla
    const totalPages = Math.ceil(totalCases / limit);

    // İstatistikleri hesapla
    const stats = await prisma.case.groupBy({
      by: ['status', 'legalApproved'],
      where: {
        OR: [
          { status: 'HUKUK_INCELEMESI' },
          { legalReviewerId: { not: null } },
        ]
      },
      _count: {
        id: true,
      },
    });

    let pending = 0;
    let approved = 0;
    let rejected = 0;

    stats.forEach(stat => {
      if (stat.status === 'HUKUK_INCELEMESI') {
        pending += stat._count.id;
      } else if (stat.legalApproved === true) {
        approved += stat._count.id;
      } else if (stat.legalApproved === false) {
        rejected += stat._count.id;
      }
    });

    return NextResponse.json({
      cases,
      totalPages,
      currentPage: page,
      totalCases,
      limit,
      stats: {
        pending,
        approved,
        rejected,
        total: totalCases,
      },
    });

  } catch (error) {
    console.error('Get legal cases error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 