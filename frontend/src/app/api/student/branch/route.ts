import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student, Branch, ChangeGrant, DateSheet, SheetRevision, Selection } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'STUDENT' || !authData.student) {
      return NextResponse.json({ error: 'Unauthorized. Student access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { branchId } = await req.json();

    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID is required.' }, { status: 400 });
    }

    const branch = await Branch.findById(branchId);
    if (!branch || !branch.active) {
      return NextResponse.json({ error: 'Selected branch is invalid or inactive.' }, { status: 400 });
    }

    const student = await Student.findById(authData.student._id);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // Check if branch selection is already set
    if (student.selectedBranchId) {
      // Must check if there is an unused approved BRANCH grant
      const unusedGrant = await ChangeGrant.findOne({
        studentId: student._id,
        type: 'BRANCH',
        consumedAt: null,
      });

      if (!unusedGrant) {
        return NextResponse.json(
          { error: 'Branch selection is write-once. You need an approved branch change request to update your branch.' },
          { status: 403 }
        );
      }

      // Consume grant atomically
      unusedGrant.consumedAt = new Date();
      await unusedGrant.save();

      // If a saved date sheet already exists, update the date sheet's revision with new branch, keeping slots intact!
      const dateSheet = await DateSheet.findOne({ studentId: student._id });
      if (dateSheet) {
        dateSheet.currentRevision += 1;
        await dateSheet.save();

        await SheetRevision.create({
          dateSheetId: dateSheet._id,
          revision: dateSheet.currentRevision,
          branchId: branch._id,
          documentSnapshot: JSON.stringify({
            studentName: student.fullName,
            registrationNumber: student.registrationNumber,
            branchName: branch.name,
            branchAddress: branch.address,
            updatedAt: new Date(),
          }),
          reason: 'Branch updated via approved change grant',
        });
      }
    }

    student.selectedBranchId = branch._id;
    await student.save();

    return NextResponse.json({
      success: true,
      selectedBranch: branch,
    });
  } catch (err: any) {
    console.error('Branch selection error:', err);
    return NextResponse.json({ error: 'Failed to set branch.' }, { status: 500 });
  }
}
