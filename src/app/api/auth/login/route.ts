import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/api-helpers';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { loginLimiter, LOGIN_RATE_LIMIT } from './rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = request.ip ?? '127.0.0.1';
  
  try {
    await loginLimiter.check(LOGIN_RATE_LIMIT, `login_${ip}`);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Too many login attempts. Please try again later.' },
      { 
        status: 429,
        headers: error.headers 
      }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return errorResponse('Username and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { username, active: true }
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      institution: user.institution,
    });

    const response = successResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        institution: user.institution,
      },
    });

    // Set cookie for SSR
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      return errorResponse(`Login failed: ${error.message}`, 500);
    }
    return errorResponse('Login failed', 500);
  }
}