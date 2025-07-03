import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const assignedBy = searchParams.get('assignedBy');
    const caseId = searchParams.get('caseId');

    // Sayfalama için offset hesapla
    const offset = (page - 1) * limit;

    // Filtreleme koşullarını oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedToId = parseInt(assignedTo);
    }

    if (assignedBy) {
      where.assignedById = parseInt(assignedBy);
    }

    if (caseId) {
      where.caseId = parseInt(caseId);
    }

    // Kullanıcı rolüne göre filtreleme
    if (currentUser.role === 'INSTITUTION_USER') {
      // Kurum kullanıcıları sadece kendilerine atanan task'ları görebilir
      where.assignedToId = currentUser.id;
    }

    // Toplam task sayısını al
    const totalTasks = await prisma.task.count({ where });

    // Task'ları getir
    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        assignedToId: true,
        assignedById: true,
        caseId: true,
        dueDate: true,
        completedAt: true,
        feedback: true,
        createdAt: true,
        updatedAt: true,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { priority: 'desc' }
      ],
      skip: offset,
      take: limit,
    });

    // Sayfalama bilgilerini hesapla
    const totalPages = Math.ceil(totalTasks / limit);

    return NextResponse.json({
      tasks,
      totalPages,
      currentPage: page,
      totalTasks,
      limit,
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Yeni task oluşturma endpoint'i
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

    // Sadece ADMIN, IDP_PERSONNEL ve LEGAL_PERSONNEL rolündeki kullanıcılar task oluşturabilir
    if (!['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Request body'yi al
    const body = await request.json();
    const {
      title,
      description,
      priority,
      assignedToId,
      caseId,
      dueDate,
    } = body;

    // Gerekli alanları kontrol et
    if (!title || !description || !assignedToId) {
      return NextResponse.json(
        { error: 'Başlık, açıklama ve atanan kişi zorunludur' },
        { status: 400 }
      );
    }

    // Atanan kullanıcının var olduğunu kontrol et
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

    // Eğer caseId verilmişse, case'in var olduğunu kontrol et
    if (caseId) {
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

    // Yeni task'ı oluştur
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        assignedToId,
        assignedById: currentUser.id,
        caseId: caseId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
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
        case: caseId ? {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        } : undefined,
      },
    });

    return NextResponse.json({
      message: 'Task başarıyla oluşturuldu',
      task: newTask,
    }, { status: 201 });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 