import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

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

    // Get filter parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignedToMe = searchParams.get('assignedToMe') === 'true';
    const createdByMe = searchParams.get('createdByMe') === 'true';

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (assignedToMe) {
      where.assignedToId = user.id;
    }

    if (createdByMe) {
      where.assignedById = user.id;
    }

    // Admin can see all tasks, others see only their tasks
    if (user.role !== 'ADMIN' && !assignedToMe && !createdByMe) {
      where.OR = [
        { assignedToId: user.id },
        { assignedById: user.id }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            username: true,
            role: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get tasks' },
      { status: 500 }
    );
  }
}

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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create tasks' }, { status: 403 });
    }

    const data = await request.json();
    const { title, description, priority, assignedToId, caseId, dueDate } = data;

    // Validate required fields
    if (!title || !description || !assignedToId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        assignedToId: parseInt(assignedToId),
        assignedById: user.id,
        caseId: caseId ? parseInt(caseId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING'
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            username: true,
            role: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        case: true
      }
    });

    // Create initial comment if provided
    if (data.initialComment) {
      await prisma.taskComment.create({
        data: {
          taskId: task.id,
          userId: user.id,
          comment: data.initialComment
        }
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}