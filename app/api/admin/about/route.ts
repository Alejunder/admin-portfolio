import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateAboutSchema } from '@/lib/validators';

/**
 * GET /api/admin/about
 * Admin endpoint to fetch About section data for editing
 */
export async function GET() {
  try {
    const about = await prisma.about.findFirst();

    if (!about) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({ 
      success: true,
      data: about 
    });
  } catch (error) {
    console.error('[API Error] GET /api/admin/about:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/about
 * Admin endpoint to create or update About section data
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = updateAboutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: result.error.issues 
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if About record exists
    const existing = await prisma.about.findFirst();

    let about;
    if (existing) {
      // Update existing record
      about = await prisma.about.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          description: data.description,
          shortBio: data.shortBio || null,
          location: data.location || null,
          email: data.email || null,
        },
      });
    } else {
      // Create new record
      about = await prisma.about.create({
        data: {
          title: data.title,
          description: data.description,
          shortBio: data.shortBio || null,
          location: data.location || null,
          email: data.email || null,
        },
      });
    }

    console.log('[API Success] PUT /api/admin/about - About section updated');

    return NextResponse.json({ 
      success: true,
      data: about 
    });
  } catch (error) {
    console.error('[API Error] PUT /api/admin/about:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update about data' },
      { status: 500 }
    );
  }
}
