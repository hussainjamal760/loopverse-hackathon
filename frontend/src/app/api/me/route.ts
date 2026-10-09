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
        phone: student.phone,
        cnic: student.cnic,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        photoUrl: student.photoUrl,
        fatherName: student.fatherName,
        parentCnic: student.parentCnic,
        occupation: student.occupation,
        contactNumber: student.contactNumber,
        emergencyContact: student.emergencyContact,
        program: student.program,
        semester: student.semester,
        sessionBatch: student.sessionBatch,
        prevQualification: student.prevQualification,
        prevInstitute: student.prevInstitute,
        marksOrCgpa: student.marksOrCgpa,
        selectedBranchId: student.selectedBranchId,
        branch: student.selectedBranchId, // populated branch object
        assignmentsFinalized: student.assignmentsFinalized,
        version: student.version,
      } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
