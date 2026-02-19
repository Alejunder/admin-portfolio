import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/api/admin');

  if (isProtectedRoute) {
    // Handle OPTIONS preflight for admin API routes (should not require auth)
    if (pathname.startsWith('/api/admin') && request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
        },
      });
    }

    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Redirect to login for dashboard routes
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // Return 401 for API routes
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Check if user has ADMIN role
      if (payload.role !== 'ADMIN') {
        if (pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (err) {
      // Invalid or expired token
      console.error('[Middleware] Token verification failed:', err);
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // Handle CORS for public API routes
  const isPublicApiRoute = pathname.startsWith('/api/') && 
                          !pathname.startsWith('/api/admin');

  if (isPublicApiRoute) {
    const response = NextResponse.next();
    
    // Allow requests from your frontend
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://alecam.dev',
      'https://www.alecam.dev',
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
