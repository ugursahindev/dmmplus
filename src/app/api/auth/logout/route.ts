import { NextRequest } from 'next/server';
import { successResponse } from '@/utils/api-helpers';

export async function POST(request: NextRequest) {
  // In a JWT-based system, logout is handled client-side by removing the token
  // This endpoint is provided for consistency and future extensions
  const response = successResponse({ message: 'Logged out successfully' });
  
  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}