import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // API route'ları için authentication kontrolü
  if (request.nextUrl.pathname.startsWith('/api/auth/me')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/auth/me',
    '/api/auth/logout',
  ],
}; 