import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization') || undefined;
    const token = authUtils.extractTokenFromHeader(authorization);

    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const payload = authUtils.verifyToken(token);
    const body = await request.json();
    const { fullName, email, username } = body;

    // Validasyon
    if (!fullName || !email || !username) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email formatı' },
        { status: 400 }
      );
    }

    // Kullanıcının mevcut bilgilerini kontrol et
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Email ve username benzersizlik kontrolü (kendi bilgileri hariç)
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        id: { not: payload.userId }
      }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const existingUsername = await prisma.user.findFirst({
      where: {
        username,
        id: { not: payload.userId }
      }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Profili güncelle
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        fullName,
        email,
        username,
        updatedAt: new Date()
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
      }
    });

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 