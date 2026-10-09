import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Course, Assignment, ExamSlot, AuditEvent } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const assignedCount = await Assignment.countDocuments({ courseId: id });
    const slotsCount = await ExamSlot.countDocuments({ courseId: id });

    return NextResponse.json({ course, assignedCount, slotsCount });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve course details' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    await connectToDatabase();
    const body = await req.json();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (body.title !== undefined) course.title = body.title.trim();
    if (body.creditHours !== undefined) course.creditHours = parseInt(body.creditHours, 10);
    if (body.department !== undefined) course.department = body.department.trim();
    if (body.active !== undefined) course.active = Boolean(body.active);

    await course.save();

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'UPDATE_COURSE',
      entityType: 'Course',
      entityId: course._id.toString(),
      sanitizedMetadata: JSON.stringify({ code: course.code, active: course.active }),
    });

    return NextResponse.json({ course });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Safe deletion integrity check per artifacts/05-DATA-MODEL.md
    const hasAssignments = await Assignment.exists({ courseId: id });
    const hasSlots = await ExamSlot.exists({ courseId: id });

    if (hasAssignments || hasSlots) {
      return NextResponse.json(
        {
          error:
            'Course has existing student assignments or scheduled exam slots. Academic integrity protection prevents deletion. Deactivate the course instead to archive it.',
          canDeactivate: true,
        },
        { status: 409 }
      );
    }

    await Course.findByIdAndDelete(id);

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'DELETE_COURSE',
      entityType: 'Course',
      entityId: id,
      sanitizedMetadata: JSON.stringify({ code: course.code, title: course.title }),
    });

    return NextResponse.json({ success: true, message: `Course ${course.code} deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
