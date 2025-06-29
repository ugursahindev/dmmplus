import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/api-helpers';

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    try {
      const decoded = verifyToken(token);
      
      // Only admins can view user details
      if (decoded.role !== 'ADMIN') {
        return errorResponse('Forbidden', 403);
      }
    } catch (error) {
      return errorResponse('Invalid token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        institution: true,
        active: true,
        createdAt: true,
        _count: {
          select: {
            createdCases: true,
            legalReviewedCases: true,
            finalReviewedCases: true,
            institutionResponses: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    try {
      const decoded = verifyToken(token);
      
      // Only admins can update users
      if (decoded.role !== 'ADMIN') {
        return errorResponse('Forbidden', 403);
      }
    } catch (error) {
      return errorResponse('Invalid token', 401);
    }

    const data = await request.json();
    const updateData: any = {
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      institution: data.institution || null,
      active: data.active,
    };

    // Hash password if provided
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        institution: true,
        active: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Username or email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    try {
      const decoded = verifyToken(token);
      
      // Only admins can delete users
      if (decoded.role !== 'ADMIN') {
        return errorResponse('Forbidden', 403);
      }
      
      // Prevent deleting self
      if (decoded.userId === parseInt(id)) {
        return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 });
      }
    } catch (error) {
      return errorResponse('Invalid token', 401);
    }

    // Check if user has related data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            createdCases: true,
            legalReviewedCases: true,
            finalReviewedCases: true,
            institutionResponses: true,
            caseActions: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if user has any related data
    const hasRelatedData = Object.values(user._count).some(count => count > 0);
    
    if (hasRelatedData) {
      // Soft delete - just deactivate the user
      await prisma.user.update({
        where: { id: parseInt(id) },
        data: { active: false }
      });
      
      return NextResponse.json({
        success: true,
        message: 'User deactivated (has related data)'
      });
    } else {
      // Hard delete - remove user completely
      await prisma.user.delete({
        where: { id: parseInt(id) }
      });
      
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}