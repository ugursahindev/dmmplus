import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

// Mesaj okundu işaretleme
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
    const { messageIds, conversationId } = body;

    // Gerekli alanları kontrol et
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Mesaj ID\'leri gereklidir' },
        { status: 400 }
      );
    }

    // Konuşmanın var olduğunu ve kullanıcının katılımcı olduğunu kontrol et
    if (conversationId) {
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
        select: { id: true },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Konuşma bulunamadı veya erişim yetkiniz yok' },
          { status: 404 }
        );
      }
    }

    // Mesajların var olduğunu ve kullanıcının erişim yetkisi olduğunu kontrol et
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
        conversation: {
          participants: {
            some: {
              userId: currentUser.id,
              isActive: true,
            },
          },
        },
      },
      select: {
        id: true,
        conversationId: true,
      },
    });

    if (messages.length !== messageIds.length) {
      return NextResponse.json(
        { error: 'Bazı mesajlar bulunamadı veya erişim yetkiniz yok' },
        { status: 400 }
      );
    }

    // Mesajları okundu olarak işaretle
    const readRecords = await Promise.all(
      messageIds.map(async (messageId) => {
        return prisma.messageRead.upsert({
          where: {
            messageId_userId: {
              messageId: messageId,
              userId: currentUser.id,
            },
          },
          update: {
            readAt: new Date(),
          },
          create: {
            messageId: messageId,
            userId: currentUser.id,
          },
        });
      })
    );

    // Konuşmanın son okuma zamanını güncelle
    if (conversationId) {
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId: conversationId,
          userId: currentUser.id,
        },
        data: {
          lastReadAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Mesajlar başarıyla okundu olarak işaretlendi',
      readCount: readRecords.length,
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 