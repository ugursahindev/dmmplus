import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/utils/api-helpers';
import { canViewCase, canEditCase } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params;
      const caseId = parseInt(id);
      
      const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          creator: {
            select: { id: true, username: true, fullName: true },
          },
          legalReviewer: {
            select: { id: true, username: true, fullName: true },
          },
          finalReviewer: {
            select: { id: true, username: true, fullName: true },
          },
          institutionResponder: {
            select: { id: true, username: true, fullName: true },
          },
          files: true,
          history: {
            include: {
              user: {
                select: { username: true, fullName: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!caseItem) {
        return errorResponse('Case not found', 404);
      }

      if (!canViewCase(user.role, caseItem.status)) {
        return errorResponse('Insufficient permissions to view this case', 403);
      }

      // Parse tags from JSON string
      const caseData = {
        ...caseItem,
        tags: caseItem.tags ? (typeof caseItem.tags === 'string' ? JSON.parse(caseItem.tags) : caseItem.tags) : [],
      };

      return successResponse(caseData);
    } catch (error) {
      console.error('Get case error:', error);
      return errorResponse('Failed to fetch case', 500);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params;
      const caseId = parseInt(id);
      const updates = await request.json();
      
      const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
      });
      
      if (!caseItem) {
        return errorResponse('Case not found', 404);
      }

      if (!canEditCase(user.role, caseItem.status)) {
        return errorResponse('Insufficient permissions to edit this case', 403);
      }

      const oldStatus = caseItem.status;
      
      // Convert tags array to JSON string if provided
      if (updates.tags && Array.isArray(updates.tags)) {
        updates.tags = JSON.stringify(updates.tags);
      }

      // Remove frontend-only fields that don't exist in the database
      const { assessment, approved, notes, response, correctiveInfo, historyNotes, ...dbUpdates } = updates;

      // Handle status transitions based on role
      if (updates.status && updates.status !== oldStatus) {
        // Validate status transition
        const validTransitions = getValidTransitions(oldStatus, user.role);
        if (!validTransitions.includes(updates.status)) {
          return errorResponse('Invalid status transition', 400);
        }

        // Add role-specific fields
        if (updates.status === 'HUKUK_INCELEMESI' && oldStatus === 'IDP_FORM') {
          dbUpdates.idpNotes = updates.idpNotes || caseItem.idpNotes;
          dbUpdates.idpAssessment = updates.idpAssessment || caseItem.idpAssessment;
        } else if (updates.status === 'SON_KONTROL' && user.role === 'LEGAL_PERSONNEL') {
          dbUpdates.legalReviewerId = user.userId;
          dbUpdates.legalReviewDate = new Date();
        } else if (updates.status === 'RAPOR_URETIMI' && user.role === 'IDP_PERSONNEL') {
          dbUpdates.finalReviewerId = user.userId;
          dbUpdates.finalReviewDate = new Date();
        } else if (updates.status === 'TAMAMLANDI' && user.role === 'INSTITUTION_USER') {
          dbUpdates.institutionResponderId = user.userId;
          dbUpdates.institutionResponseDate = new Date();
        }
      }
      
      const [updatedCase] = await prisma.$transaction([
        prisma.case.update({
          where: { id: caseId },
          data: dbUpdates,
          include: {
            creator: {
              select: { id: true, username: true, fullName: true },
            },
            legalReviewer: {
              select: { id: true, username: true, fullName: true },
            },
            finalReviewer: {
              select: { id: true, username: true, fullName: true },
            },
            institutionResponder: {
              select: { id: true, username: true, fullName: true },
            },
          },
        }),
        // Create history entry if status changed
        ...(updates.status && updates.status !== oldStatus
          ? [
              prisma.caseHistory.create({
                data: {
                  caseId: caseItem.id,
                  userId: user.userId,
                  action: `Durum güncellendi: ${getStatusLabel(oldStatus)} → ${getStatusLabel(updates.status)}`,
                  oldStatus,
                  newStatus: updates.status,
                  notes: updates.historyNotes,
                },
              }),
            ]
          : []),
      ]);

      // Parse tags back to array
      const caseData = {
        ...updatedCase,
        tags: updatedCase.tags ? (typeof updatedCase.tags === 'string' ? JSON.parse(updatedCase.tags) : updatedCase.tags) : [],
      };

      return successResponse(caseData);
    } catch (error: any) {
      console.error('Update case error:', error);
      console.error('Error details:', error.message);
      if (error.code === 'P2025') {
        return errorResponse('Case not found', 404);
      }
      return errorResponse(error.message || 'Failed to update case', 500);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      // Only admins can delete cases
      if (user.role !== 'ADMIN') {
        return errorResponse('Only administrators can delete cases', 403);
      }

      const { id } = await params;
      const caseId = parseInt(id);
      
      const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
      });
      
      if (!caseItem) {
        return errorResponse('Case not found', 404);
      }

      await prisma.case.delete({
        where: { id: caseId },
      });

      return successResponse({ message: 'Case deleted successfully' });
    } catch (error) {
      console.error('Delete case error:', error);
      return errorResponse('Failed to delete case', 500);
    }
  });
}

function getValidTransitions(currentStatus: string, userRole: string): string[] {
  const transitions: Record<string, Record<string, string[]>> = {
    IDP_FORM: {
      IDP_PERSONNEL: ['HUKUK_INCELEMESI'],
      ADMIN: ['HUKUK_INCELEMESI', 'SON_KONTROL', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR', 'TAMAMLANDI'],
    },
    HUKUK_INCELEMESI: {
      LEGAL_PERSONNEL: ['SON_KONTROL', 'IDP_FORM'],
      ADMIN: ['SON_KONTROL', 'IDP_FORM', 'RAPOR_URETIMI', 'KURUM_BEKLENIYOR', 'TAMAMLANDI'],
    },
    SON_KONTROL: {
      IDP_PERSONNEL: ['RAPOR_URETIMI', 'HUKUK_INCELEMESI'],
      ADMIN: ['RAPOR_URETIMI', 'HUKUK_INCELEMESI', 'KURUM_BEKLENIYOR', 'TAMAMLANDI'],
    },
    RAPOR_URETIMI: {
      IDP_PERSONNEL: ['KURUM_BEKLENIYOR', 'SON_KONTROL'],
      ADMIN: ['KURUM_BEKLENIYOR', 'SON_KONTROL', 'TAMAMLANDI'],
    },
    KURUM_BEKLENIYOR: {
      INSTITUTION_USER: ['TAMAMLANDI'],
      ADMIN: ['TAMAMLANDI', 'RAPOR_URETIMI'],
    },
    TAMAMLANDI: {
      ADMIN: ['KURUM_BEKLENIYOR', 'RAPOR_URETIMI'],
    },
  };

  return transitions[currentStatus]?.[userRole] || [];
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    IDP_FORM: 'IDP Formu',
    HUKUK_INCELEMESI: 'Hukuk İncelemesi',
    SON_KONTROL: 'Son Kontrol',
    RAPOR_URETIMI: 'Rapor Üretimi',
    KURUM_BEKLENIYOR: 'Kurum Bekleniyor',
    TAMAMLANDI: 'Tamamlandı',
  };
  return labels[status] || status;
}