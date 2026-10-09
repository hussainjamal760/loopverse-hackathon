import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ExamSlot, Course, Assignment } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const authData = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

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
        .populate('courseId', 'code title creditHours')
        .sort({ startsAt: 1 });

      return NextResponse.json({ slots });
    }

    // Admin query with pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    const query: any = {};
    if (courseId) {
      query.courseId = courseId;
    }

    const total = await ExamSlot.countDocuments(query);
    const slots = await ExamSlot.find(query)
      .populate('courseId', 'code title creditHours')
      .sort({ startsAt: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      slots,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
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

    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid start or end time format.' }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ error: 'End time must be strictly after start time.' }, { status: 400 });
    }

    const slot = await ExamSlot.create({
      courseId,
      startsAt: start,
      endsAt: end,
      status: status || 'DRAFT',
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create exam slot' }, { status: 500 });
  }
}
