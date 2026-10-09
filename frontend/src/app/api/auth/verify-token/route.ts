import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { PasswordToken, User, Student, Branch } from '@/server/models';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get('token');

    if (!rawToken) {
      return NextResponse.json({ valid: false, error: 'Activation token is missing.' }, { status: 400 });
    }

    await connectToDatabase();

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const tokenDoc = await PasswordToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      // Check if already used
      const usedDoc = await PasswordToken.findOne({ tokenHash });
      if (usedDoc && usedDoc.usedAt) {
        return NextResponse.json(
          { valid: false, error: 'This activation link has already been used. Please log in with your credentials.' },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired activation token. Please contact the administrator.' },
        { status: 404 }
      );
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user || !user.active) {
      return NextResponse.json({ valid: false, error: 'Account is not active or not found.' }, { status: 403 });
    }

    const student = await Student.findOne({ userId: user._id }).populate('selectedBranchId');
    const branches = await Branch.find({ active: true }).sort({ code: 1 });

    return NextResponse.json({
      valid: true,
      purpose: tokenDoc.purpose,
      student: student
        ? {
            id: student._id,
            fullName: student.fullName,
            registrationNumber: student.registrationNumber,
            email: user.email,
            phone: student.phone,
            cnic: student.cnic,
            program: student.program,
            semester: student.semester,
            sessionBatch: student.sessionBatch,
            selectedBranchId: student.selectedBranchId?._id || student.selectedBranchId || null,
          }
        : {
            email: user.email,
            fullName: 'Student Candidate',
          },
      branches: branches.map((b) => ({
        id: b._id,
        code: b.code,
        name: b.name,
        city: b.city,
        address: b.address,
        contactNumber: b.contactNumber,
      })),
    });
  } catch (err: any) {
    console.error('Verify token error:', err);
    return NextResponse.json({ valid: false, error: 'Failed to verify activation token.' }, { status: 500 });
  }
}
