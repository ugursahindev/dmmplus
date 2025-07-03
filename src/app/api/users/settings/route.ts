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

    const payload = authUtils.verifyToken(token);

    // Kullanıcı ayarlarını getir (şimdilik varsayılan değerler)
    const settings = {
      notifications: {
        emailNotifications: true,
        newCaseAlert: true,
        statusChangeAlert: true,
        legalReviewAlert: false,
        institutionResponseAlert: false,
      },
      system: {
        sessionTimeout: '480',
        maxLoginAttempts: '5',
        passwordExpireDays: '90',
        enableTwoFactor: false,
        maintenanceMode: false,
      }
    };

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

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
    const { notifications, system } = body;

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Bildirim ayarlarını güncelle
    if (notifications) {
      // Burada bildirim ayarlarını veritabanına kaydedebilirsiniz
      // Şimdilik sadece başarı mesajı döndürüyoruz
      console.log('Notification settings updated:', notifications);
    }

    // Sistem ayarlarını güncelle (sadece admin kullanıcılar için)
    if (system && user.role === 'ADMIN') {
      // Burada sistem ayarlarını veritabanına kaydedebilirsiniz
      // Şimdilik sadece başarı mesajı döndürüyoruz
      console.log('System settings updated:', system);
    }

    return NextResponse.json({
      message: 'Ayarlar başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 