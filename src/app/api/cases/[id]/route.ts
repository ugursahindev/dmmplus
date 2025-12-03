import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/auth';

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

    // Sadece ADMIN rolündeki kullanıcılar vaka silebilir
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
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

    // Vakayı sil (ilişkili kayıtlar cascade ile silinecek)
    await prisma.case.delete({
      where: { id: caseId },
    });

    return NextResponse.json({
      message: 'Vaka başarıyla silindi',
    });

  } catch (error) {
    console.error('Delete case error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Tekil vaka detayını getirme
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
    const caseId = parseInt(resolvedParams.id);

    if (isNaN(caseId)) {
      return NextResponse.json(
        { error: 'Geçersiz vaka ID' },
        { status: 400 }
      );
    }

    // Vakayı tüm detaylarıyla getir
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        legalReviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        finalReviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        institutionResponder: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
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
          },
        },
        history: {
          select: {
            id: true,
            action: true,
            oldStatus: true,
            newStatus: true,
            notes: true,
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
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            dueDate: true,
            completedAt: true,
            feedback: true,
            createdAt: true,
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            files: true,
            tasks: true,
            history: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: 'Vaka bulunamadı' },
        { status: 404 }
      );
    }

    // Tags'ı JSON'dan parse et
    const caseWithParsedTags = {
      ...caseData,
      tags: typeof caseData.tags === 'string' ? JSON.parse(caseData.tags) : caseData.tags,
    };

    return NextResponse.json(caseWithParsedTags);

  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Vaka güncelleme
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
      select: {
        id: true,
        status: true,
        createdById: true,
      },
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Vaka bulunamadı' },
        { status: 404 }
      );
    }

    // Yetki kontrolü: Sadece vaka sahibi, ADMIN veya ilgili rol kullanıcıları düzenleyebilir
    const canEdit = 
      currentUser.role === 'ADMIN' ||
      existingCase.createdById === currentUser.id ||
      (currentUser.role === 'LEGAL_PERSONNEL' && ['HUKUK_INCELEMESI', 'SON_KONTROL'].includes(existingCase.status)) ||
      (currentUser.role === 'INSTITUTION_USER' && existingCase.status === 'KURUM_BEKLENIYOR');

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Bu vakayı düzenleme yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Request body'yi al
    const body = await request.json();
    const {
      title,
      description,
      platform,
      priority,
      tags,
      geographicScope,
      sourceType,
      sourceUrl,
      status,
      // IDP Form fields
      idpAssessment,
      idpNotes,
      // Legal Review fields
      legalAssessment,
      legalNotes,
      legalApproved,
      // Final Control fields
      finalNotes,
      finalApproval,
      // Report fields
      internalReport,
      externalReport,
      targetMinistry,
      targetInstitutionId,
      // Institution Response fields
      institutionResponse,
      correctiveInfo,
      // Additional news fields
      newsHeadline,
      newspaperAuthor,
      newsSummary,
      ministryInfo,
      relatedMinistry,
      submittedTo,
      submittingUnit,
      preparedBy,
      disinformationType,
      expertEvaluation,
      legalEvaluation,
      recommendationDMM,
      recommendationDMK,
    } = body;

    // Güncelleme verilerini hazırla
    const updateData: any = {};

    // Temel alanlar (herkes düzenleyebilir)
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (platform !== undefined) updateData.platform = platform;
    if (priority !== undefined) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (geographicScope !== undefined) updateData.geographicScope = geographicScope;
    if (sourceType !== undefined) updateData.sourceType = sourceType;
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;

    // Status güncellemesi - rol bazlı kontroller
    if (status !== undefined) {
      // ADMIN her zaman status güncelleyebilir
      if (currentUser.role === 'ADMIN') {
        updateData.status = status;
      }
      // LEGAL_PERSONNEL: HUKUK_INCELEMESI -> SON_KONTROL geçişi yapabilir
      else if (currentUser.role === 'LEGAL_PERSONNEL' && 
               existingCase.status === 'HUKUK_INCELEMESI' && 
               status === 'SON_KONTROL') {
        updateData.status = status;
      }
      // IDP_PERSONNEL: SON_KONTROL -> RAPOR_URETIMI, RAPOR_URETIMI -> KURUM_BEKLENIYOR geçişleri yapabilir
      else if (currentUser.role === 'IDP_PERSONNEL' && 
               ((existingCase.status === 'SON_KONTROL' && status === 'RAPOR_URETIMI') ||
                (existingCase.status === 'RAPOR_URETIMI' && status === 'KURUM_BEKLENIYOR'))) {
        updateData.status = status;
      }
      // INSTITUTION_USER: KURUM_BEKLENIYOR -> TAMAMLANDI geçişi yapabilir
      else if (currentUser.role === 'INSTITUTION_USER' && 
               existingCase.status === 'KURUM_BEKLENIYOR' && 
               status === 'TAMAMLANDI') {
        updateData.status = status;
      }
      // Vaka sahibi IDP_PERSONNEL ise IDP_FORM -> HUKUK_INCELEMESI geçişi yapabilir
      else if (existingCase.createdById === currentUser.id && 
               currentUser.role === 'IDP_PERSONNEL' &&
               existingCase.status === 'IDP_FORM' && 
               status === 'HUKUK_INCELEMESI') {
        updateData.status = status;
      }
    }

    // Rol bazlı güncelleme alanları
    if (currentUser.role === 'ADMIN' || existingCase.createdById === currentUser.id) {
      if (idpAssessment !== undefined) updateData.idpAssessment = idpAssessment;
      if (idpNotes !== undefined) updateData.idpNotes = idpNotes;
      if (newsHeadline !== undefined) updateData.newsHeadline = newsHeadline;
      if (newspaperAuthor !== undefined) updateData.newspaperAuthor = newspaperAuthor;
      if (newsSummary !== undefined) updateData.newsSummary = newsSummary;
      if (ministryInfo !== undefined) updateData.ministryInfo = ministryInfo;
      if (relatedMinistry !== undefined) updateData.relatedMinistry = relatedMinistry;
      if (submittedTo !== undefined) updateData.submittedTo = submittedTo;
      if (submittingUnit !== undefined) updateData.submittingUnit = submittingUnit;
      if (preparedBy !== undefined) updateData.preparedBy = preparedBy;
      if (disinformationType !== undefined) updateData.disinformationType = disinformationType;
      if (expertEvaluation !== undefined) updateData.expertEvaluation = expertEvaluation;
      if (legalEvaluation !== undefined) updateData.legalEvaluation = legalEvaluation;
      if (recommendationDMM !== undefined) updateData.recommendationDMM = recommendationDMM;
      if (recommendationDMK !== undefined) updateData.recommendationDMK = recommendationDMK;
    }

    // Hukuk personeli alanları
    if (currentUser.role === 'LEGAL_PERSONNEL' || currentUser.role === 'ADMIN') {
      if (legalAssessment !== undefined) updateData.legalAssessment = legalAssessment;
      if (legalNotes !== undefined) updateData.legalNotes = legalNotes;
      if (legalApproved !== undefined) {
        updateData.legalApproved = legalApproved;
        updateData.legalReviewerId = currentUser.id;
        updateData.legalReviewDate = new Date();
      }
      if (finalNotes !== undefined) updateData.finalNotes = finalNotes;
      if (finalApproval !== undefined) {
        updateData.finalApproval = finalApproval;
        updateData.finalReviewerId = currentUser.id;
        updateData.finalReviewDate = new Date();
      }
      if (internalReport !== undefined) updateData.internalReport = internalReport;
      if (externalReport !== undefined) updateData.externalReport = externalReport;
      if (targetMinistry !== undefined) updateData.targetMinistry = targetMinistry;
      if (targetInstitutionId !== undefined) updateData.targetInstitutionId = targetInstitutionId;
      if (updateData.externalReport) {
        updateData.reportGeneratedDate = new Date();
      }
    }

    // IDP_PERSONNEL rapor oluşturma sırasında targetInstitutionId güncelleyebilir
    if (currentUser.role === 'IDP_PERSONNEL' || currentUser.role === 'ADMIN') {
      if (targetInstitutionId !== undefined) updateData.targetInstitutionId = targetInstitutionId;
      if (targetMinistry !== undefined) updateData.targetMinistry = targetMinistry;
      if (internalReport !== undefined) updateData.internalReport = internalReport;
      if (externalReport !== undefined) updateData.externalReport = externalReport;
    }

    // Kurum kullanıcısı alanları
    if (currentUser.role === 'INSTITUTION_USER' || currentUser.role === 'ADMIN') {
      if (institutionResponse !== undefined) updateData.institutionResponse = institutionResponse;
      if (correctiveInfo !== undefined) updateData.correctiveInfo = correctiveInfo;
      if (institutionResponse !== undefined) {
        updateData.institutionResponderId = currentUser.id;
        updateData.institutionResponseDate = new Date();
      }
    }

    // Vakayı güncelle
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        legalReviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        finalReviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        institutionResponder: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    // Vaka geçmişine kayıt ekle
    await prisma.caseHistory.create({
      data: {
        caseId: caseId,
        userId: currentUser.id,
        action: 'Vaka güncellendi',
        oldStatus: existingCase.status,
        newStatus: updatedCase.status,
        notes: 'Vaka bilgileri güncellendi',
      },
    });

    return NextResponse.json({
      message: 'Vaka başarıyla güncellendi',
      case: updatedCase,
    });

  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 