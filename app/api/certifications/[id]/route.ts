import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const certification = await prisma.certification.findFirst({
      where: {
        id,
        published: true, // Only return published certifications
      },
    });

    if (!certification) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: certification 
    });
  } catch (error) {
    console.error('Get certification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
      { status: 500 }
    );
  }
}
