import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { createCertificationSchema, updateCertificationSchema } from '@/lib/validators';
import { CacheManager } from '@/lib/cache';

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

    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.certification.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: certifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API Error] GET /api/admin/certifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certifications' },
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
    const result = createCertificationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const certification = await prisma.certification.create({
      data: {
        ...result.data,
        credentialUrl: result.data.credentialUrl || null,
      },
    });

    // Invalidate certifications cache
    CacheManager.invalidateCertifications('admin:create');

    return NextResponse.json({ success: true, data: certification }, { status: 201 });
  } catch (error) {
    console.error('[API Error] POST /api/admin/certifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create certification' },
      { status: 500 }
    );
  }
}
