import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

// Tekil task detayını getirme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Geçersiz task ID' },
        { status: 400 }
      );
    }

    // Task'ı tüm detaylarıyla getir
    const taskData = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            status: true,
          },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!taskData) {
      return NextResponse.json(
        { error: 'Task bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı rolüne göre erişim kontrolü
    if (currentUser.role === 'INSTITUTION_USER' && taskData.assignedToId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Bu task\'a erişim yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      task: taskData,
    });

  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Task güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Geçersiz task ID' },
        { status: 400 }
      );
    }

    // Task'ı kontrol et
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        assignedToId: true,
        assignedById: true,
        status: true,
        caseId: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task bulunamadı' },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    const canEdit = 
      currentUser.role === 'ADMIN' ||
      currentUser.id === existingTask.assignedById ||
      currentUser.id === existingTask.assignedToId;

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Bu task\'ı düzenleme yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Request body'yi al
    const body = await request.json();
    const {
      title,
      description,
      priority,
      status,
      assignedToId,
      caseId,
      dueDate,
      feedback,
    } = body;

    // Güncellenecek alanları hazırla
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (caseId !== undefined) updateData.caseId = caseId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (feedback !== undefined) updateData.feedback = feedback;

    // Status COMPLETED ise completedAt'i güncelle
    if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status !== 'COMPLETED' && existingTask.status === 'COMPLETED') {
      updateData.completedAt = null;
    }

    // Atanan kullanıcı değiştirilmişse kontrol et
    if (assignedToId && assignedToId !== existingTask.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, active: true },
      });

      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Atanan kullanıcı bulunamadı' },
          { status: 404 }
        );
      }

      if (!assignedUser.active) {
        return NextResponse.json(
          { error: 'Atanan kullanıcının hesabı aktif değil' },
          { status: 400 }
        );
      }
    }

    // Eğer caseId değiştirilmişse kontrol et
    if (caseId && caseId !== existingTask.caseId) {
      const existingCase = await prisma.case.findUnique({
        where: { id: caseId },
      });

      if (!existingCase) {
        return NextResponse.json(
          { error: 'Belirtilen vaka bulunamadı' },
          { status: 404 }
        );
      }
    }

    // Task'ı güncelle
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Task başarıyla güncellendi',
      task: updatedTask,
    });

  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Task silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Sadece ADMIN rolündeki kullanıcılar task silebilir
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Geçersiz task ID' },
        { status: 400 }
      );
    }

    // Task'ı kontrol et
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task bulunamadı' },
        { status: 404 }
      );
    }

    // Task'ı sil (ilişkili kayıtlar cascade ile silinecek)
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({
      message: 'Task başarıyla silindi',
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 