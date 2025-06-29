import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/utils/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, jwtPayload) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.userId },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          institution: true,
          active: true,
        },
      });

      if (!user || !user.active) {
        return errorResponse('User not found or inactive', 404);
      }

      return successResponse(user);
    } catch (error) {
      console.error('Get user error:', error);
      return errorResponse('Failed to get user information', 500);
    }
  });
}