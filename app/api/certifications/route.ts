import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addCorsHeaders, getCorsHeaders } from '@/lib/cors';

/**
 * OPTIONS /api/certifications
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
 * GET /api/certifications
 * Public endpoint to fetch certifications
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    const certifications = await prisma.certification.findMany({
      where: {
        published: true, // Only return published certifications
        ...(featured === 'true' ? { featured: true } : {}),
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const response = NextResponse.json({ 
      success: true,
      data: certifications 
    });
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('[API Error] GET /api/certifications:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch certifications' },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}
