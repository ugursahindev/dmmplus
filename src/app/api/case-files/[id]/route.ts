import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const fileId = parseInt(resolvedParams.id);

    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya ID' },
        { status: 400 }
      );
    }

    const caseFile = await prisma.caseFile.findUnique({
      where: { id: fileId },
      select: {
        fileName: true,
        fileType: true,
        fileData: true,
      },
    });

    if (!caseFile || !caseFile.fileData) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    return new NextResponse(caseFile.fileData, {
      status: 200,
      headers: {
        'Content-Type': caseFile.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${caseFile.fileName}"`,
        'Cache-Control': 'private, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Dosya getirme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

