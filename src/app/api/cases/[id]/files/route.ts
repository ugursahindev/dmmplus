import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';
// Dosyaları uzak veritabanına yazmak için fs kullanımı kaldırıldı

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

    // Kullanıcıyı veritabanından getir
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        active: true,
      },
    });

    if (!currentUser || !currentUser.active) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const caseId = parseInt(resolvedParams.id);

    if (isNaN(caseId)) {
      return NextResponse.json(
        { error: 'Geçersiz vaka ID' },
        { status: 400 }
      );
    }

    // Vakayı kontrol et
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Vaka bulunamadı' },
        { status: 404 }
      );
    }

    // FormData'yı al
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    // Her dosyayı yükle
    for (const file of files) {
      // Dosya tipini kontrol et - sadece görüntü formatları
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        continue; // İzin verilmeyen dosya tipini atla
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Dosyayı doğrudan veritabanına kaydet
      const created = await prisma.caseFile.create({
        data: {
          caseId: caseId,
          fileName: file.name,
          filePath: 'pending',
          fileType: file.type,
          fileSize: file.size,
          uploadedById: currentUser.id,
          fileData: buffer,
        },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          uploadedAt: true,
          uploadedById: true,
        },
      });

      const filePath = `/api/case-files/${created.id}`;

      const caseFile = await prisma.caseFile.update({
        where: { id: created.id },
        data: { filePath },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          uploadedAt: true,
          uploader: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          filePath: true,
        },
      });

      uploadedFiles.push(caseFile);
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli dosya formatı bulunamadı. Sadece PNG, JPG ve JPEG formatları desteklenmektedir.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Dosyalar başarıyla yüklendi',
      files: uploadedFiles,
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

