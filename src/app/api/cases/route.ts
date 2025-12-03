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
        institutionId: true,
        institution: true,
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

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const platform = searchParams.get('platform');

    // Sayfalama için offset hesapla
    const offset = (page - 1) * limit;

    // Filtreleme koşullarını oluştur
    const whereConditions: any[] = [];

    // Base filters (status, priority, platform)arama
    if (status) {
      whereConditions.push({ status });
    }

    if (priority) {
      whereConditions.push({ priority });
    }

    if (platform) {
      whereConditions.push({ platform });
    }

    // Search filter - SQLite doesn't support mode: 'insensitive'
    // Using contains which is case-sensitive in SQLite
    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereConditions.push({
        OR: [
          { caseNumber: { contains: searchTerm } },
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ]
      });
    }

    // INSTITUTION_USER için sadece kendi kurumuna gönderilen vakaları göster
    if (currentUser.role === 'INSTITUTION_USER' && currentUser.institutionId) {
      whereConditions.push({
        OR: [
          { targetInstitutionId: currentUser.institutionId },
          { targetMinistry: currentUser.institution || '' },
        ],
      });
      whereConditions.push({
        status: {
          in: ['KURUM_BEKLENIYOR', 'TAMAMLANDI'],
        },
      });
    }

    // Build final where clause
    const where = whereConditions.length > 0 
      ? (whereConditions.length === 1 ? whereConditions[0] : { AND: whereConditions })
      : {};

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
        creator: {
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
        targetMinistry: true,
        targetInstitutionId: true,
        targetInstitution: {
          select: {
            id: true,
            name: true,
          },
        },
        institutionResponse: true,
        institutionResponseDate: true,
        institutionResponder: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
        { createdAt: 'desc' },
        { caseNumber: 'asc' }
      ],
      skip: offset,
      take: limit,
    });

    // Sayfalama bilgilerini hesapla
    const totalPages = Math.ceil(totalCases / limit);

    return NextResponse.json({
      cases,
      totalPages,
      currentPage: page,
      totalCases,
      limit,
    });

  } catch (error: any) {
    console.error('Get cases error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    return NextResponse.json(
      { 
        error: 'Sunucu hatası',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

// Yeni vaka oluşturma endpoint'i
export async function POST(request: NextRequest) {
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

    // Sadece IDP_PERSONNEL ve ADMIN rolündeki kullanıcılar vaka oluşturabilir
    if (!['IDP_PERSONNEL', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Request body'yi al
    const body = await request.json();
    const {
      caseNumber,
      title,
      description,
      platform,
      priority,
      tags,
      geographicScope,
      sourceType,
      sourceUrl,
    } = body;

    // Gerekli alanları kontrol et
    if (!caseNumber || !title || !description || !platform || !priority || !geographicScope || !sourceType) {
      return NextResponse.json(
        { error: 'Tüm gerekli alanlar doldurulmalıdır' },
        { status: 400 }
      );
    }

    // Vaka numarasının benzersiz olduğunu kontrol et
    const existingCase = await prisma.case.findUnique({
      where: { caseNumber },
    });

    if (existingCase) {
      return NextResponse.json(
        { error: 'Bu vaka numarası zaten kullanılmaktadır' },
        { status: 400 }
      );
    }

    // Yeni vakayı oluştur
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title,
        description,
        platform,
        priority,
        tags: JSON.stringify(tags || []),
        geographicScope,
        sourceType,
        sourceUrl,
        createdById: currentUser.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    // Vaka geçmişine kayıt ekle
    await prisma.caseHistory.create({
      data: {
        caseId: newCase.id,
        userId: currentUser.id,
        action: 'Vaka oluşturuldu',
        oldStatus: 'IDP_FORM',
        newStatus: 'IDP_FORM',
        notes: 'Yeni vaka oluşturuldu',
      },
    });

    return NextResponse.json({
      message: 'Vaka başarıyla oluşturuldu',
      case: newCase,
    }, { status: 201 });

  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 