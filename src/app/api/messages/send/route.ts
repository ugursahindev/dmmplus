import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Send a message
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { conversationId, content } = await request.json();

    if (!conversationId || !content || content.trim() === '') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id
        }
      }
    });

    if (!participant || !participant.isActive) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            role: true
          }
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: content.trim()
      }
    });

    // Mark as read by sender
    await prisma.messageRead.create({
      data: {
        messageId: message.id,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}