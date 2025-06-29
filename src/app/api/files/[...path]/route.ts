import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the file path from the URL
    const filePath = params.path.join('/');
    
    // Security check - prevent path traversal
    if (filePath.includes('..') || filePath.includes('~')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Authentication check
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7) || request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const payload = verifyToken(token);
      
      // For uploaded files, check if user has access
      if (filePath.startsWith('uploads/')) {
        const caseId = parseInt(filePath.split('/')[1]);
        
        if (isNaN(caseId)) {
          return NextResponse.json({ error: 'Invalid case ID' }, { status: 400 });
        }

        // Check if case exists and user has permission
        const caseRecord = await prisma.case.findUnique({
          where: { id: caseId },
          include: { 
            createdBy: true,
            files: true
          }
        });

        if (!caseRecord) {
          return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        // Check permissions based on user role
        const user = await prisma.user.findUnique({
          where: { id: payload.userId }
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user can view the case
        const canView = 
          user.role === 'ADMIN' || 
          caseRecord.createdById === payload.userId ||
          (user.role === 'LEGAL_PERSONNEL' && ['HUKUK_INCELEMESI', 'SON_KONTROL', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR', 'TAMAMLANDI'].includes(caseRecord.status)) ||
          (user.role === 'INSTITUTION_USER' && ['KURUM_BEKLENIYOR', 'TAMAMLANDI'].includes(caseRecord.status));

        if (!canView) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Check if the specific file belongs to this case
        const fileExists = caseRecord.files.some(f => f.filePath === `/${filePath}`);
        if (!fileExists) {
          return NextResponse.json({ error: 'File not found in case' }, { status: 404 });
        }
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'public', filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);

    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(fullPath)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}