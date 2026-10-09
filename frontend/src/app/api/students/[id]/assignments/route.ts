import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student, Assignment, DateSheet, Selection, AuditEvent, Course } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const assignments = await Assignment.find({ studentId: id }).populate('courseId');
    const student = await Student.findById(id);
    const dateSheet = await DateSheet.findOne({ studentId: id });

    return NextResponse.json({
      assignments,
      assignmentsFinalized: student?.assignmentsFinalized || false,
      hasDateSheet: !!dateSheet,
      dateSheetRevision: dateSheet?.currentRevision || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();
    const { courseIds, finalize, allowWithDateSheet } = body;

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // Check if date sheet already saved
    const existingDateSheet = await DateSheet.findOne({ studentId: id });
    if (existingDateSheet && !allowWithDateSheet) {
      return NextResponse.json(
        {
          error: 'Cannot modify course assignments: student has already generated a saved Date Sheet.',
          hasDateSheet: true,
          dateSheetRevision: existingDateSheet.currentRevision,
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(courseIds)) {
      return NextResponse.json({ error: 'courseIds must be an array of course IDs.' }, { status: 400 });
    }

    const uniqueCourseIds = Array.from(new Set(courseIds));

    if (finalize) {
      if (uniqueCourseIds.length < 4 || uniqueCourseIds.length > 6) {
        return NextResponse.json(
          { error: `Finalized assignment set must contain between 4 and 6 unique courses. Received: ${uniqueCourseIds.length}` },
          { status: 400 }
        );
      }
    }

    // If overriding with date sheet, remove previous dateSheet & selections so student can replan safely
    if (existingDateSheet && allowWithDateSheet) {
      await Selection.deleteMany({ dateSheetId: existingDateSheet._id });
      await DateSheet.deleteOne({ _id: existingDateSheet._id });
    }

    // Delete previous assignments and insert new set
    await Assignment.deleteMany({ studentId: id });
    const docs = uniqueCourseIds.map((cId) => ({
      studentId: id,
      courseId: cId,
    }));
    if (docs.length > 0) {
      await Assignment.insertMany(docs);
    }

    student.assignmentsFinalized = !!finalize;
    await student.save();

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'UPDATE_COURSE_ASSIGNMENTS',
      entityType: 'Student',
      entityId: student._id.toString(),
      sanitizedMetadata: JSON.stringify({
        courseCount: uniqueCourseIds.length,
        courseIds: uniqueCourseIds,
        finalized: !!finalize,
        dateSheetReset: !!(existingDateSheet && allowWithDateSheet),
      }),
    });

    const updatedAssignments = await Assignment.find({ studentId: id }).populate('courseId');

    return NextResponse.json({
      success: true,
      assignmentsFinalized: student.assignmentsFinalized,
      assignments: updatedAssignments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update assignments' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const existingDateSheet = await DateSheet.findOne({ studentId: id });
    if (existingDateSheet) {
      return NextResponse.json(
        {
          error: 'Cannot delete course assignments: student has already saved a Date Sheet.',
          hasDateSheet: true,
          dateSheetRevision: existingDateSheet.currentRevision,
        },
        { status: 400 }
      );
    }

    if (courseId) {
      // Remove specific course
      await Assignment.deleteOne({ studentId: id, courseId });
    } else {
      // Remove all assignments
      await Assignment.deleteMany({ studentId: id });
    }

    const remainingCount = await Assignment.countDocuments({ studentId: id });
    if (remainingCount < 4) {
      student.assignmentsFinalized = false;
      await student.save();
    }

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: courseId ? 'REMOVE_SINGLE_COURSE_ASSIGNMENT' : 'CLEAR_ALL_COURSE_ASSIGNMENTS',
      entityType: 'Student',
      entityId: student._id.toString(),
      sanitizedMetadata: JSON.stringify({
        courseId: courseId || 'ALL',
        remainingCount,
      }),
    });

    const updatedAssignments = await Assignment.find({ studentId: id }).populate('courseId');

    return NextResponse.json({
      success: true,
      remainingCount,
      assignmentsFinalized: student.assignmentsFinalized,
      assignments: updatedAssignments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete assignment' }, { status: 500 });
  }
}
