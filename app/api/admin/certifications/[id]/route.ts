import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { updateCertificationSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const certification = await prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: certification });
  } catch (error) {
    console.error('[API Error] GET /api/admin/certifications/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certification' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const result = updateCertificationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    // Prepare update data, handling nullable JSON fields properly
    const updateData: Record<string, any> = {};
    
    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.issuer !== undefined) updateData.issuer = result.data.issuer ?? undefined;
    if (result.data.imageUrl !== undefined) updateData.imageUrl = result.data.imageUrl;
    if (result.data.credentialUrl !== undefined) updateData.credentialUrl = result.data.credentialUrl ?? null;
    if (result.data.published !== undefined) updateData.published = result.data.published;
    if (result.data.featured !== undefined) updateData.featured = result.data.featured;
    if (result.data.order !== undefined) updateData.order = result.data.order;

    const certification = await prisma.certification.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: certification });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      );
    }
    console.error('[API Error] PATCH /api/admin/certifications/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update certification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    await prisma.certification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Certification deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      );
    }
    console.error('[API Error] DELETE /api/admin/certifications/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}
