import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const task = await prisma.task.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            username: true,
            role: true,
            email: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true
          }
        },
        case: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check access - admin can see all, others can see only their tasks
    if (user.role !== 'ADMIN' && 
        task.assignedToId !== user.id && 
        task.assignedById !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const data = await request.json();

    // Get the task to check permissions
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check permissions
    const isAssignee = existingTask.assignedToId === user.id;
    const isAssigner = existingTask.assignedById === user.id;
    const isAdmin = user.role === 'ADMIN';

    // Assignee can update status and feedback
    if (isAssignee) {
      const updateData: any = {};
      
      if (data.status) {
        updateData.status = data.status;
        if (data.status === 'COMPLETED') {
          updateData.completedAt = new Date();
        }
      }
      
      if (data.feedback !== undefined) {
        updateData.feedback = data.feedback;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          assignedTo: true,
          assignedBy: true,
          case: true,
          comments: {
            include: {
              user: true
            }
          }
        }
      });

      return NextResponse.json({ success: true, task: updatedTask });
    }

    // Admin and assigner can update other fields
    if (isAdmin || isAssigner) {
      const updateData: any = {};
      
      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (data.priority) updateData.priority = data.priority;
      if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
      }
      if (data.assignedToId) updateData.assignedToId = parseInt(data.assignedToId);
      if (data.status) {
        updateData.status = data.status;
        if (data.status === 'COMPLETED') {
          updateData.completedAt = new Date();
        }
      }
      if (data.feedback !== undefined) updateData.feedback = data.feedback;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          assignedTo: true,
          assignedBy: true,
          case: true,
          comments: {
            include: {
              user: true
            }
          }
        }
      });

      return NextResponse.json({ success: true, task: updatedTask });
    }

    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

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
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete tasks' }, { status: 403 });
    }

    const params = await context.params;
    await prisma.task.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}