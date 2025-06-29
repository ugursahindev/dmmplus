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
    const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined);
    
    if (!token) {
      return errorResponse('Authentication token required', 401);
    }

    const user = verifyToken(token);
    return await handler(request, user);
  } catch (error) {
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