import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addCorsHeaders, getCorsHeaders } from '@/lib/cors';

/**
 * OPTIONS /api/about
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * GET /api/about
 * Public endpoint to fetch About section data
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    // Get the first (and only) About record
    const about = await prisma.about.findFirst({
      select: {
        id: true,
        title: true,
        description: true,
        shortBio: true,
        location: true,
        email: true,
        updatedAt: true,
      },
    });

    // If no About record exists, return default data
    if (!about) {
      const response = NextResponse.json({
        success: true,
        data: {
          title: { en: 'About Me', es: 'Sobre Mí' },
          description: { en: '', es: '' },
          shortBio: null,
          location: null,
          email: null,
          updatedAt: new Date().toISOString(),
        },
      });
      return addCorsHeaders(response, origin);
    }

    const response = NextResponse.json({ 
      success: true,
      data: about 
    });
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('[API Error] GET /api/about:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch about data' },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}
