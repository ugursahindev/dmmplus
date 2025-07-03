import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

// Mesaj gönderme
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

    // Request body'yi al
    const body = await request.json();
    const { conversationId, content } = body;

    // Gerekli alanları kontrol et
    if (!conversationId || !content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Konuşma ID ve mesaj içeriği gereklidir' },
        { status: 400 }
      );
    }

    // Konuşmanın var olduğunu ve kullanıcının katılımcı olduğunu kontrol et
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: currentUser.id,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        isGroup: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Konuşma bulunamadı veya erişim yetkiniz yok' },
        { status: 404 }
      );
    }

    // Mesajı oluştur
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: currentUser.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            role: true,
          },
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Konuşmanın son mesaj bilgilerini güncelle
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: content.trim(),
        updatedAt: new Date(),
      },
    });

    // Gönderen kişi için mesajı okundu olarak işaretle
    await prisma.messageRead.create({
      data: {
        messageId: message.id,
        userId: currentUser.id,
      },
    });

    return NextResponse.json({
      message,
    }, { status: 201 });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 