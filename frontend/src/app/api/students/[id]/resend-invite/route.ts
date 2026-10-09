import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { Student, User, PasswordToken, AuditEvent } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';
import { sendStudentSetupEmail } from '@/server/email/mailer';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const student = await Student.findById(id).populate('userId');
    if (!student || !student.userId) {
      return NextResponse.json({ error: 'Student or user account not found.' }, { status: 404 });
    }

    const user = student.userId as any;

    // Invalidate prior unused setup tokens
    await PasswordToken.deleteMany({
      userId: user._id,
      purpose: 'SETUP',
      usedAt: null,
    });

    // Generate fresh setup token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await PasswordToken.create({
      userId: user._id,
      tokenHash,
      purpose: 'SETUP',
      expiresAt,
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const setupUrl = `${appUrl}/set-password?token=${rawToken}`;

    const emailResult = await sendStudentSetupEmail({
      userId: user._id.toString(),
      to: user.email,
      studentName: student.fullName,
      setupUrl,
      expiresInHours: 24,
    });

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'RESEND_INVITE',
      entityType: 'Student',
      entityId: student._id.toString(),
      sanitizedMetadata: JSON.stringify({ email: user.email, emailSent: emailResult.sent }),
    });

    return NextResponse.json({
      success: true,
      setupUrl,
      emailSent: emailResult.sent,
      message: `Setup invitation resent to ${user.email}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to resend invite' }, { status: 500 });
  }
}
