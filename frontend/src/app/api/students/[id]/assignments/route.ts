import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student, Assignment, DateSheet } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const assignments = await Assignment.find({ studentId: id }).populate('courseId');
    const student = await Student.findById(id);

    return NextResponse.json({
      assignments,
      assignmentsFinalized: student?.assignmentsFinalized || false,
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
    const { courseIds, finalize } = await req.json(); // courseIds: string[], finalize: boolean

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // Check if date sheet already saved
    const existingDateSheet = await DateSheet.findOne({ studentId: id });
    if (existingDateSheet) {
      return NextResponse.json(
        { error: 'Cannot modify course assignments after a student has saved a date sheet.' },
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

    // Delete previous assignments and insert new set
    await Assignment.deleteMany({ studentId: id });
    const docs = uniqueCourseIds.map((cId) => ({
      studentId: id,
      courseId: cId,
    }));
    await Assignment.insertMany(docs);

    student.assignmentsFinalized = !!finalize;
    await student.save();

    const updatedAssignments = await Assignment.find({ studentId: id }).populate('courseId');

    return NextResponse.json({
      success: true,
      assignmentsFinalized: student.assignmentsFinalized,
      assignments: updatedAssignments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update assignments' }, { status: 500 });
  }
}
