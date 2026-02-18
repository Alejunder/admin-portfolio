import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const certification = await prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ certification });
  } catch (error) {
    console.error('Get certification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
      { status: 500 }
    );
  }
}
