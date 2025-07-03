import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

// Task yorumlarını getirme
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

    // Task'ın var olduğunu kontrol et
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        assignedToId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı rolüne göre erişim kontrolü
    if (currentUser.role === 'INSTITUTION_USER' && task.assignedToId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Bu task\'a erişim yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Sayfalama için offset hesapla
    const offset = (page - 1) * limit;

    // Yorumları getir
    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Toplam yorum sayısını al
    const totalComments = await prisma.taskComment.count({
      where: { taskId },
    });

    // Sayfalama bilgilerini hesapla
    const totalPages = Math.ceil(totalComments / limit);

    return NextResponse.json({
      comments,
      totalPages,
      currentPage: page,
      totalComments,
      limit,
    });

  } catch (error) {
    console.error('Get task comments error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Yeni yorum ekleme
export async function POST(
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

    // Task'ın var olduğunu kontrol et
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        assignedToId: true,
        assignedById: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task bulunamadı' },
        { status: 404 }
      );
    }

    // Yetki kontrolü - Task'a atanan kişi, task'ı oluşturan kişi veya admin yorum ekleyebilir
    const canComment = 
      currentUser.role === 'ADMIN' ||
      currentUser.id === task.assignedToId ||
      currentUser.id === task.assignedById;

    if (!canComment) {
      return NextResponse.json(
        { error: 'Bu task\'a yorum ekleme yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Request body'yi al
    const body = await request.json();
    const { comment } = body;

    // Gerekli alanları kontrol et
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Yorum metni zorunludur' },
        { status: 400 }
      );
    }

    // Yeni yorumu oluştur
    const newComment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: currentUser.id,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Yorum başarıyla eklendi',
      comment: newComment,
    }, { status: 201 });

  } catch (error) {
    console.error('Create task comment error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 