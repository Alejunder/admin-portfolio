import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addCorsHeaders, getCorsHeaders } from '@/lib/cors';

/**
 * OPTIONS /api/projects
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
 * GET /api/projects
 * Public endpoint to fetch projects
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    const projects = await prisma.project.findMany({
      where: {
        published: true, // Only return published projects
        ...(featured === 'true' ? { featured: true } : {}),
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        technologies: true,
        accentColor: true,
        imageUrl: true,
        githubUrl: true,
        liveUrl: true,
        featured: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response = NextResponse.json({ 
      success: true,
      data: projects 
    });
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('[API Error] GET /api/projects:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}
