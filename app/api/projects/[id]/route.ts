import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: project 
    });
  } catch (error) {
    console.error('[API Error] GET /api/projects/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
