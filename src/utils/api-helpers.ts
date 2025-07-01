import { NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { JWTPayload } from '@/types';

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function withAuth(
  request: Request,
  handler: (request: Request, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Try to get token from Authorization header first
    let token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined);
    let tokenSource = 'header';
    
    // If no token in header, try to get from cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      console.log('Cookie header:', cookieHeader);
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        console.log('Parsed cookies:', cookies);
        token = cookies.token;
        tokenSource = 'cookie';
      }
    }
    
    console.log('Token source:', tokenSource, 'Token exists:', !!token);
    
    if (!token) {
      return errorResponse('Authentication token required', 401);
    }

    const user = verifyToken(token);
    console.log('Token verified successfully for user:', user.username);
    return await handler(request, user);
  } catch (error) {
    console.error('withAuth error:', error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return errorResponse('Invalid authentication token', 401);
    }
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return errorResponse('Authentication token expired', 401);
    }
    return errorResponse('Authentication failed', 401);
  }
}

export async function withRole(
  request: Request,
  allowedRoles: string[],
  handler: (request: Request, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    if (!allowedRoles.includes(user.role)) {
      return errorResponse('Insufficient permissions', 403);
    }
    return handler(req, user);
  });
}

export function generateCaseNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `DMM-${year}${month}${day}-${random}`;
}