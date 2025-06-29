import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse, generateCaseNumber } from '@/utils/api-helpers';
import { canViewCase } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status');
      const priority = searchParams.get('priority');
      const search = searchParams.get('search');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;

      const where: Prisma.CaseWhereInput = {};

      // Role-based filtering
      if (user.role === 'LEGAL_PERSONNEL') {
        where.status = {
          in: ['HUKUK_INCELEMESI', 'SON_KONTROL', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR', 'TAMAMLANDI'],
        };
      } else if (user.role === 'INSTITUTION_USER') {
        where.status = 'KURUM_BEKLENIYOR';
      }

      // Additional filters
      if (status) where.status = status as any;
      if (priority) where.priority = priority as any;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { caseNumber: { contains: search } },
        ];
      }

      const [cases, count] = await Promise.all([
        prisma.case.findMany({
          where,
          include: {
            creator: {
              select: { id: true, username: true, fullName: true },
            },
            files: {
              select: { id: true, fileName: true, fileType: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.case.count({ where }),
      ]);

      // Parse tags for each case
      const casesWithParsedTags = cases.map(caseItem => ({
        ...caseItem,
        tags: caseItem.tags ? (typeof caseItem.tags === 'string' ? JSON.parse(caseItem.tags) : caseItem.tags) : [],
      }));

      return successResponse({
        cases: casesWithParsedTags,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error('Get cases error:', error);
      return errorResponse('Failed to fetch cases', 500);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Only admin and IDP personnel can create cases
      if (!['ADMIN', 'IDP_PERSONNEL'].includes(user.role)) {
        return errorResponse('Insufficient permissions', 403);
      }

      const data = await request.json();
      
      const newCase = await prisma.case.create({
        data: {
          ...data,
          caseNumber: generateCaseNumber(),
          status: 'IDP_FORM',
          createdById: user.userId,
          tags: JSON.stringify(data.tags || []),
        },
        include: {
          creator: {
            select: { id: true, username: true, fullName: true },
          },
        },
      });

      // Create history entry
      await prisma.caseHistory.create({
        data: {
          caseId: newCase.id,
          userId: user.userId,
          action: 'Vaka oluşturuldu',
          oldStatus: 'IDP_FORM',
          newStatus: 'IDP_FORM',
          notes: 'Yeni vaka kaydı',
        },
      });

      // Return case with parsed tags
      const caseData = {
        ...newCase,
        tags: newCase.tags ? (typeof newCase.tags === 'string' ? JSON.parse(newCase.tags) : newCase.tags) : [],
      };
      
      return successResponse(caseData, 201);
    } catch (error) {
      console.error('Create case error:', error);
      return errorResponse('Failed to create case', 500);
    }
  });
}