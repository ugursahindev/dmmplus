import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params;
    const taskId = parseInt(params.id);
    const { comment } = await request.json();

    if (!comment || comment.trim() === '') {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    // Check if user has access to this task
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check access
    if (user.role !== 'ADMIN' && 
        task.assignedToId !== user.id && 
        task.assignedById !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const newComment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: user.id,
        comment: comment.trim()
      },
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
    });

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}