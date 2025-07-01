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

    // Sadece ADMIN rolündeki kullanıcılar tüm kullanıcıları görebilir
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // Varsayılan limit'i 20'ye çıkar
    const role = searchParams.get('role');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    // Sayfalama için offset hesapla
    const offset = (page - 1) * limit;

    // Filtreleme koşullarını oluştur
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (active !== null && active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Toplam kullanıcı sayısını al
    const totalUsers = await prisma.user.count({ where });

    // Kullanıcıları getir
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        institution: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdCases: true,
            legalReviewedCases: true,
            finalReviewedCases: true,
            institutionResponses: true,
          }
        }
        // Şifre alanını dahil etmiyoruz (güvenlik)
      },
      orderBy: [
        { createdAt: 'desc' },
        { username: 'asc' }
      ],
      skip: offset,
      take: limit,
    });

    // Sayfalama bilgilerini hesapla
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Yeni kullanıcı oluşturma endpoint'i (sadece ADMIN)
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

    // Sadece ADMIN rolündeki kullanıcılar yeni kullanıcı oluşturabilir
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Request body'yi al
    const body = await request.json();
    const { username, password, email, fullName, role, institution } = body;

    // Gerekli alanları kontrol et
    if (!username || !password || !email || !fullName || !role) {
      return NextResponse.json(
        { error: 'Tüm gerekli alanlar doldurulmalıdır' },
        { status: 400 }
      );
    }

    // Geçerli roller
    const validRoles = ['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL', 'INSTITUTION_USER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Geçersiz rol' },
        { status: 400 }
      );
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email formatı' },
        { status: 400 }
      );
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Kullanıcı adı ve email benzersizliğini kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı veya email zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hash'le
    const hashedPassword = await authUtils.hashPassword(password);

    // Yeni kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        fullName,
        role,
        institution: institution || null,
        active: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        institution: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: newUser,
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 