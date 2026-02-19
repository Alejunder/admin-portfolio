import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createContactMessageSchema } from '@/lib/validators';
import { addCorsHeaders, getCorsHeaders } from '@/lib/cors';

/**
 * OPTIONS /api/contact
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
 * POST /api/contact
 * Public endpoint to submit contact messages
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const body = await request.json();
    
    // Validate input
    const result = createContactMessageSchema.safeParse(body);
    if (!result.success) {
      const response = NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

    const { name, email, subject, message } = result.data;

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
        ipAddress,
        userAgent,
        status: 'UNREAD',
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully',
      id: contactMessage.id,
    }, { status: 201 });
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('Contact form error:', error);
    const response = NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}
