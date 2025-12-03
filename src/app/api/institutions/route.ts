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

    // Kullanıcıyı veritabanından getir
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

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const active = searchParams.get('active');

    // Filtreleme koşullarını oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (active !== null && active !== undefined) {
      where.active = active === 'true';
    } else {
      // Varsayılan olarak sadece aktif kurumları getir
      where.active = true;
    }

    // Kurumları getir
    const institutions = await prisma.institution.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            cases: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      institutions,
    });
  } catch (error) {
    console.error('Get institutions error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
