import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { createProjectSchema, updateProjectSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const published = searchParams.get('published');

    const where = published !== null ? { published: published === 'true' } : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API Error] GET /api/admin/projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const result = createProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.project.findUnique({
      where: { slug: result.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A project with this slug already exists' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        ...result.data,
        imageUrl: result.data.imageUrl || null,
        githubUrl: result.data.githubUrl || null,
        liveUrl: result.data.liveUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('[API Error] POST /api/admin/projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
