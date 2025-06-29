import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get user's conversations
export async function GET(request: NextRequest) {
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

    // Get conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
            isActive: true
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                role: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(p => p.userId === user.id);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            createdAt: { gt: participant?.lastReadAt || new Date(0) }
          }
        });

        return {
          ...conv,
          unreadCount
        };
      })
    );

    return NextResponse.json({ success: true, conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

// Create a new conversation
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

    const { participantIds, title, initialMessage } = await request.json();

    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 });
    }

    // Check if conversation already exists with these exact participants
    if (participantIds.length === 1) {
      const existingConv = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: [user.id, participantIds[0]]
              }
            }
          }
        },
        include: {
          participants: true
        }
      });

      if (existingConv && existingConv.participants.length === 2) {
        return NextResponse.json({ 
          success: true, 
          conversation: existingConv,
          existing: true 
        });
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: title || null,
        isGroup: participantIds.length > 1,
        participants: {
          create: [
            { userId: user.id },
            ...participantIds.map((id: number) => ({ userId: id }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                role: true
              }
            }
          }
        }
      }
    });

    // Create initial message if provided
    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: initialMessage
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessageText: initialMessage
        }
      });
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}