import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Gerekli alanları kontrol et
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcıyı veritabanında ara
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        email: true,
        fullName: true,
        role: true,
        institution: true,
        active: true,
      },
    });

    // Kullanıcı bulunamadıysa
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Kullanıcı aktif değilse
    if (!user.active) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil' },
        { status: 401 }
      );
    }

    // Şifreyi doğrula
    const isPasswordValid = await authUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    const token = authUtils.generateToken(tokenPayload);

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Giriş başarılı',
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 