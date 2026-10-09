import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ExamSlot, Course, Assignment, Selection, AuditEvent } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const authData = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    // If student, filter for published, future slots belonging to assigned courses
    if (authData?.user.role === 'STUDENT' && authData.student) {
      const studentAssignments = await Assignment.find({ studentId: authData.student._id });
      const assignedCourseIds = studentAssignments.map((a) => a.courseId);

      const filterQuery: any = {
        status: 'PUBLISHED',
        startsAt: { $gt: new Date() },
        courseId: courseId ? courseId : { $in: assignedCourseIds },
      };

      const slots = await ExamSlot.find(filterQuery)
        .populate('courseId', 'code title creditHours department')
        .sort({ startsAt: 1 });

      return NextResponse.json({ slots });
    }

    // Admin query with search, course/status filters, and pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    const query: any = {};
    if (courseId) {
      query.courseId = courseId;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      const matchingCourses = await Course.find({
        $or: [
          { code: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      query.courseId = { $in: matchingCourses.map((c) => c._id) };
    }

    const total = await ExamSlot.countDocuments(query);
    const rawSlots = await ExamSlot.find(query)
      .populate('courseId', 'code title creditHours department active')
      .sort({ startsAt: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    // Compute booked count for each slot to enable protection
    const slots = await Promise.all(
      rawSlots.map(async (slot) => {
        const bookedCount = await Selection.countDocuments({ slotId: slot._id });
        return {
          ...slot.toObject(),
          bookedCount,
          isBooked: bookedCount > 0,
        };
      })
    );

    return NextResponse.json({
      slots,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch exam schedules' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { courseId, startsAt, endsAt, status } = await req.json();

    if (!courseId || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'courseId, startsAt, and endsAt are required.' }, { status: 400 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Selected academic course does not exist.' }, { status: 404 });
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid start or end datetime format.' }, { status: 400 });
    }

    // Validation rule 1: No slot in the past
    if (start <= new Date()) {
      return NextResponse.json({ error: 'Cannot create an exam slot in the past.' }, { status: 400 });
    }

    // Validation rule 2: End time strictly after start time
    if (end <= start) {
      return NextResponse.json({ error: 'End time must be strictly after start time.' }, { status: 400 });
    }

    // Validation rule 3: No duplicate slot for the same course
    const existingDuplicate = await ExamSlot.findOne({
      courseId,
      startsAt: start,
      endsAt: end,
    });
    if (existingDuplicate) {
      return NextResponse.json(
        { error: `An identical exam slot for course ${course.code} with this exact time interval already exists.` },
        { status: 400 }
      );
    }

    const slot = await ExamSlot.create({
      courseId,
      startsAt: start,
      endsAt: end,
      status: status || 'DRAFT',
      version: 1,
    });

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'CREATE_EXAM_SLOT',
      entityType: 'ExamSlot',
      entityId: slot._id.toString(),
      sanitizedMetadata: JSON.stringify({
        courseCode: course.code,
        startsAt: start.toISOString(),
        status: slot.status,
      }),
    });

    const populated = await ExamSlot.findById(slot._id).populate('courseId', 'code title creditHours department');

    return NextResponse.json({ slot: populated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create exam slot' }, { status: 500 });
  }
}
