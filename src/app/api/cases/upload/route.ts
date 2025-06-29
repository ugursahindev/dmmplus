import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/api-helpers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    
    if (!token) {
      return errorResponse('Token bulunamadı', 401);
    }

    let userId: number;
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch (error) {
      return errorResponse('Geçersiz token', 401);
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;

    if (!file) {
      return errorResponse('Dosya bulunamadı', 400);
    }

    if (!caseId) {
      return errorResponse('Vaka ID gerekli', 400);
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Geçersiz dosya tipi. Sadece PDF, JPG, PNG, DOC ve DOCX dosyaları yüklenebilir.', 400);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse('Dosya boyutu 10MB\'dan büyük olamaz', 400);
    }

    // Check if case exists and user has permission
    const caseRecord = await prisma.case.findUnique({
      where: { id: parseInt(caseId) },
      include: { createdBy: true }
    });

    if (!caseRecord) {
      return errorResponse('Vaka bulunamadı', 404);
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return errorResponse('Kullanıcı bulunamadı', 404);
    }

    // Only admin, case creator, or assigned personnel can upload files
    const canUpload = 
      user.role === 'ADMIN' || 
      caseRecord.createdById === userId ||
      (user.role === 'LEGAL_PERSONNEL' && ['HUKUK_INCELEMESI', 'SON_KONTROL'].includes(caseRecord.status)) ||
      (user.role === 'INSTITUTION_USER' && caseRecord.status === 'KURUM_BEKLENIYOR');

    if (!canUpload) {
      return errorResponse('Bu işlem için yetkiniz yok', 403);
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', caseId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = path.extname(file.name);
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save file record to database
    const fileRecord = await prisma.caseFile.create({
      data: {
        fileName: file.name,
        filePath: `/uploads/${caseId}/${fileName}`,
        fileType: file.type,
        fileSize: file.size,
        caseId: parseInt(caseId),
        uploadedById: userId
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    // Update case updatedAt
    await prisma.case.update({
      where: { id: parseInt(caseId) },
      data: { updatedAt: new Date() }
    });

    return successResponse({
      file: fileRecord,
      message: 'Dosya başarıyla yüklendi'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return errorResponse('Dosya yükleme hatası', 500);
  }
}