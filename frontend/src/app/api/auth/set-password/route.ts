import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import {
  PasswordToken,
  User,
  Student,
  Branch,
  Session,
  AuditEvent,
} from '@/server/models';
import { createSession } from '@/server/auth/session';

export async function POST(req: Request) {
  try {
    const { token, password, selectedBranchId, phone } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    await connectToDatabase();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const tokenDoc = await PasswordToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return NextResponse.json(
        { error: 'Invalid or expired activation token. A second simultaneous or repeated submission is rejected.' },
        { status: 400 }
      );
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // 1. Hash new password
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.active = true;
    await user.save();

    // 2. Mark token consumed atomically
    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    // 3. Invalidate other outstanding password tokens for this user
    await PasswordToken.deleteMany({
      userId: user._id,
      _id: { $ne: tokenDoc._id },
    });

    // 4. Revoke previous sessions
    await Session.deleteMany({ userId: user._id });

    // 5. Update Student profile if branch or phone provided
    const student = await Student.findOne({ userId: user._id });
    if (student) {
      if (selectedBranchId) {
        const branch = await Branch.findById(selectedBranchId);
        if (branch && branch.active) {
          student.selectedBranchId = branch._id;
        }
      }
      if (phone) {
        student.phone = phone.trim();
      }
      student.version = (student.version || 1) + 1;
      await student.save();
    }

    // 6. Record audit event
    await AuditEvent.create({
      actorUserId: user._id,
      action: 'SET_PASSWORD',
      entityType: 'User',
      entityId: user._id.toString(),
      sanitizedMetadata: JSON.stringify({ email: user.email, purpose: tokenDoc.purpose }),
    });

    // 7. Auto-authenticate student session so they transition seamlessly
    await createSession(user._id.toString());

    return NextResponse.json({
      success: true,
      message: 'Password established successfully. Account activated.',
      redirectUrl: '/student/planner',
    });
  } catch (err: any) {
    console.error('Set password error:', err);
    return NextResponse.json({ error: 'Failed to set password. Please try again.' }, { status: 500 });
  }
}
