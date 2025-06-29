import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get users to start conversation with
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // Get all active users except current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: decoded.userId },
        active: true,
        OR: search ? [
          { fullName: { contains: search } },
          { username: { contains: search } },
          { email: { contains: search } }
        ] : undefined
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true
      },
      orderBy: {
        fullName: 'asc'
      },
      take: 20
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get users' },
      { status: 500 }
    );
  }
}