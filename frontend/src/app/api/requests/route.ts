import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ChangeRequest, Student, Branch } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    const query: any = {};
    if (authData.user.role === 'STUDENT') {
      if (!authData.student) {
        return NextResponse.json({ requests: [] });
      }
      query.studentId = authData.student._id;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (type && type !== 'ALL') {
      query.type = type;
    }

    // Search filter across student name, reg number, or reason
    if (search) {
      const matchedStudents = await Student.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { registrationNumber: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
        { studentId: { $in: matchedStudents.map((s) => s._id) } },
      ];
    }

    const total = await ChangeRequest.countDocuments(query);
    const requests = await ChangeRequest.find(query)
      .populate({
        path: 'studentId',
        select: 'fullName registrationNumber program selectedBranchId phone userId',
        populate: [
          { path: 'selectedBranchId', select: 'code name city' },
          { path: 'userId', select: 'email active' },
        ],
      })
      .populate('reviewedBy', 'email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'STUDENT' || !authData.student) {
      return NextResponse.json({ error: 'Unauthorized. Student access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { type, reason } = await req.json();

    if (!type || !['BRANCH', 'DATE_SHEET'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'A valid reason is required for your request.' }, { status: 400 });
    }

    // Check for duplicate pending request of the same type
    const existingPending = await ChangeRequest.findOne({
      studentId: authData.student._id,
      type,
      status: 'PENDING',
    });

    if (existingPending) {
      return NextResponse.json(
        { error: `You already have a pending ${type.replace('_', ' ')} request under review.` },
        { status: 400 }
      );
    }

    const request = await ChangeRequest.create({
      studentId: authData.student._id,
      type,
      reason: reason.trim(),
      status: 'PENDING',
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
