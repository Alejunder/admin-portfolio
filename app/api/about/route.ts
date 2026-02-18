import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/about
 * Public endpoint to fetch About section data
 */
export async function GET() {
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
      return NextResponse.json({
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
    }

    return NextResponse.json({ 
      success: true,
      data: about 
    });
  } catch (error) {
    console.error('[API Error] GET /api/about:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}
