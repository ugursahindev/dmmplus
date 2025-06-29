import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/init', '/unauthorized'];
  
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('token')?.value;

  // For API routes, check authorization header
  if (path.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token in authorization header
    const apiToken = authHeader.substring(7);
    try {
      verifyToken(apiToken);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } else {
    // For frontend routes, check cookie token
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', path);
      return NextResponse.redirect(url);
    }

    // Verify the cookie token
    try {
      const payload = verifyToken(token);
      
      // Role-based route protection
      const roleRoutes = {
        '/admin': ['ADMIN'],
        '/users': ['ADMIN'],
        '/legal': ['ADMIN', 'LEGAL_PERSONNEL'],
        '/institution': ['ADMIN', 'INSTITUTION_USER'],
        '/tasks': ['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL'],
        '/stats': ['ADMIN', 'IDP_PERSONNEL']
      };

      // Check role-based access
      for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
        if (path.startsWith(routePrefix) && !allowedRoles.includes(payload.role)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    } catch (error) {
      // Invalid token, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('from', path);
      return NextResponse.redirect(url);
    }
  }

  // Add CORS headers for API routes
  if (path.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Configure CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    const origin = request.headers.get('origin');
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};