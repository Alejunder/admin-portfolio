import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    return NextResponse.json({ 
      success: true,
      data: certifications 
    });
  } catch (error) {
    console.error('[API Error] GET /api/certifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}
