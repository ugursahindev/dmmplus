import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/utils/api-helpers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Build where clause based on user role
      const baseWhere: Prisma.CaseWhereInput = {};
      
      if (user.role === 'LEGAL_PERSONNEL') {
        baseWhere.status = {
          in: ['HUKUK_INCELEMESI', 'SON_KONTROL', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR', 'TAMAMLANDI'],
        };
      } else if (user.role === 'INSTITUTION_USER') {
        baseWhere.status = 'KURUM_BEKLENIYOR';
      }

      // Get total count
      const totalCases = await prisma.case.count({ where: baseWhere });

      // Get counts by status
      const statusCounts = await prisma.case.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: true,
      });

      // Get counts by priority
      const priorityCounts = await prisma.case.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: true,
      });

      // Get counts by platform
      const platformCounts = await prisma.case.groupBy({
        by: ['platform'],
        where: baseWhere,
        _count: true,
      });

      // Calculate specific metrics
      const pendingCases = await prisma.case.count({
        where: {
          ...baseWhere,
          status: 'IDP_FORM',
        },
      });

      const inProgressCases = await prisma.case.count({
        where: {
          ...baseWhere,
          status: {
            in: ['HUKUK_INCELEMESI', 'SON_KONTROL', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR'],
          },
        },
      });

      const completedCases = await prisma.case.count({
        where: {
          ...baseWhere,
          status: 'TAMAMLANDI',
        },
      });

      // Get recent cases
      const recentCases = await prisma.case.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          caseNumber: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      });

      return successResponse({
        summary: {
          total: totalCases,
          pending: pendingCases,
          inProgress: inProgressCases,
          completed: completedCases,
        },
        byStatus: statusCounts.map(item => ({
          status: item.status,
          count: item._count,
        })),
        byPriority: priorityCounts.map(item => ({
          priority: item.priority,
          count: item._count,
        })),
        byPlatform: platformCounts.map(item => ({
          platform: item.platform,
          count: item._count,
        })),
        recentCases,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return errorResponse('Failed to fetch statistics', 500);
    }
  });
}