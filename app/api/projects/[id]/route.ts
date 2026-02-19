import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addCorsHeaders, getCorsHeaders } from '@/lib/cors';

/**
 * OPTIONS /api/projects/[id]
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
 * GET /api/projects/[id]
 * Public endpoint to fetch a single project by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');

  try {
    const { id } = await params;
    
    // Support both ID and slug lookup
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        published: true, // Only return published projects
      },
    });

    if (!project) {
      const response = NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
      return addCorsHeaders(response, origin);
    }

    const response = NextResponse.json({ 
      success: true,
      data: project 
    });
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('[API Error] GET /api/projects/[id]:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}
