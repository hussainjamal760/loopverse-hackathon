import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET() {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { user, student } = authData;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      student: student ? {
        id: student._id,
        fullName: student.fullName,
        registrationNumber: student.registrationNumber,
        selectedBranchId: student.selectedBranchId,
        assignmentsFinalized: student.assignmentsFinalized,
        program: student.program,
        semester: student.semester,
        sessionBatch: student.sessionBatch,
      } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
