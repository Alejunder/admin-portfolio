import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addCorsHeaders, getCorsHeaders } from '@/lib/cors';

/**
 * OPTIONS /api/certifications/[id]
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
 * GET /api/certifications/[id]
 * Public endpoint to fetch a single certification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');

  try {
    const { id } = await params;
    
    const certification = await prisma.certification.findFirst({
      where: {
        id,
        published: true, // Only return published certifications
      },
    });

    if (!certification) {
      const response = NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      );
      return addCorsHeaders(response, origin);
    }

    const response = NextResponse.json({ 
      success: true,
      data: certification 
    });
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('[API Error] GET /api/certifications/[id]:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch certification' },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}
