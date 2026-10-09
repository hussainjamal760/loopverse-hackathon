import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student, Assignment, Course, ExamSlot, DateSheet, Selection, ChangeGrant } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET() {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'STUDENT' || !authData.student) {
      return NextResponse.json({ error: 'Unauthorized. Student access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const student = await Student.findById(authData.student._id).populate('selectedBranchId');

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    // Fetch assigned courses
    const assignments = await Assignment.find({ studentId: student._id }).populate('courseId');
    const courses = assignments.map((a) => a.courseId);

    // Fetch published future slots for assigned courses
    const courseIds = courses.map((c: any) => c._id);
    const slots = await ExamSlot.find({
      courseId: { $in: courseIds },
      status: 'PUBLISHED',
      startsAt: { $gt: new Date() },
    }).sort({ startsAt: 1 });

    // Fetch existing date sheet if any
    const existingDateSheet = await DateSheet.findOne({ studentId: student._id });
    let savedSelections: any[] = [];
    if (existingDateSheet) {
      savedSelections = await Selection.find({ dateSheetId: existingDateSheet._id })
        .populate('courseId')
        .populate('slotId');
    }

    // Check for unused approved DATE_SHEET grant
    const unusedGrant = await ChangeGrant.findOne({
      studentId: student._id,
      type: 'DATE_SHEET',
      consumedAt: null,
    });

    return NextResponse.json({
      student,
      assignmentsFinalized: student.assignmentsFinalized,
      assignedCount: courses.length,
      courses,
      slots,
      dateSheet: existingDateSheet
        ? {
            id: existingDateSheet._id,
            revision: existingDateSheet.currentRevision,
            savedAt: existingDateSheet.savedAt,
            selections: savedSelections,
          }
        : null,
      canEditDateSheet: !existingDateSheet || !!unusedGrant,
      hasUnusedGrant: !!unusedGrant,
    });
  } catch (err: any) {
    console.error('Planner error:', err);
    return NextResponse.json({ error: 'Failed to load planner data' }, { status: 500 });
  }
}
