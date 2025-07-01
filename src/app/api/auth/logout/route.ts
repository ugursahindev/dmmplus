import { NextRequest, NextResponse } from 'next/server';
import { authUtils } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization') || undefined;
    const token = authUtils.extractTokenFromHeader(authorization);

    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı doğrula (opsiyonel - client tarafında da kontrol edilebilir)
    try {
      authUtils.verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Burada session'ı veritabanından silebiliriz (Session modeli aktif olduğunda)
    // await prisma.session.deleteMany({
    //   where: { token }
    // });

    return NextResponse.json({
      message: 'Çıkış başarılı',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 