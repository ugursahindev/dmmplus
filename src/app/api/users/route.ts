import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Only admins can view all users
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Only admins can create users
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.username || !data.email || !data.fullName || !data.password || !data.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        password: hashedPassword,
        role: data.role,
        institution: data.institution || null,
        active: data.active !== false, // Default to true
      },
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
    console.error('Error creating user:', error);
    
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