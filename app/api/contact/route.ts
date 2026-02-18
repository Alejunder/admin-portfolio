import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createContactMessageSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = createContactMessageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully',
      id: contactMessage.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
