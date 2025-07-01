import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
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
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user,
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 