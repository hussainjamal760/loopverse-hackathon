import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ChangeRequest, ChangeGrant, Student } from '@/server/models';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    const query: any = {};
    if (authData.user.role === 'STUDENT') {
      if (!authData.student) {
        return NextResponse.json({ requests: [] });
      }
      query.studentId = authData.student._id;
    }

    if (status) query.status = status;
    if (type) query.type = type;

    const total = await ChangeRequest.countDocuments(query);
    const requests = await ChangeRequest.find(query)
      .populate('studentId', 'fullName registrationNumber program')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
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
