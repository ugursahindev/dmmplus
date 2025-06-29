import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get conversation details with messages
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const params = await context.params;
    const conversationId = parseInt(params.id);

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

    // Get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                role: true,
                active: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
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
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Update last read time
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id
        }
      },
      data: {
        lastReadAt: new Date()
      }
    });

    // Mark messages as read
    const unreadMessageIds = conversation.messages
      .filter(msg => msg.senderId !== user.id)
      .filter(msg => !msg.readBy.some(r => r.userId === user.id))
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      for (const messageId of unreadMessageIds) {
        try {
          await prisma.messageRead.create({
            data: {
              messageId,
              userId: user.id
            }
          });
        } catch (error) {
          // Ignore duplicate errors
        }
      }
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get conversation' },
      { status: 500 }
    );
  }
}

// Delete/Leave conversation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const params = await context.params;
    const conversationId = parseInt(params.id);

    // Mark participant as inactive (soft delete)
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: decoded.userId
        }
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave conversation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to leave conversation' },
      { status: 500 }
    );
  }
}