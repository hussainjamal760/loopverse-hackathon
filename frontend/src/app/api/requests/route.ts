import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  ChangeRequest,
  Student,
  Branch,
  Course,
  ExamSlot,
  DateSheet,
  Selection,
  Assignment,
} from '@/server/models';
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
      .populate('currentBranchId', 'code name city address')
      .populate('requestedBranchId', 'code name city address')
      .populate('targetCourseId', 'code title department')
      .populate('currentSlotId', 'startsAt endsAt status')
      .populate('requestedSlotId', 'startsAt endsAt status')
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
    console.error('Fetch requests error:', err);
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
    const body = await req.json();
    const {
      type,
      reason,
      requestedBranchId,
      targetCourseId,
      requestedSlotId,
    } = body;

    if (!type || !['BRANCH', 'DATE_SHEET'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'A valid reason is required for your request.' }, { status: 400 });
    }

    const student = await Student.findById(authData.student._id);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // Check for duplicate pending request of the same type
    const existingPending = await ChangeRequest.findOne({
      studentId: student._id,
      type,
      status: 'PENDING',
    });

    if (existingPending) {
      return NextResponse.json(
        { error: `You already have a pending ${type.replace('_', ' ')} request under review.` },
        { status: 400 }
      );
    }

    let currentBranchId: any = student.selectedBranchId || null;
    let targetBranchId: any = null;
    let verifiedTargetCourseId: any = null;
    let currentSlotId: any = null;
    let verifiedRequestedSlotId: any = null;

    if (type === 'BRANCH') {
      if (!requestedBranchId) {
        return NextResponse.json(
          { error: 'Please select the target campus branch you wish to transfer to.' },
          { status: 400 }
        );
      }

      const branchExists = await Branch.findOne({ _id: requestedBranchId, active: true });
      if (!branchExists) {
        return NextResponse.json({ error: 'Selected branch is invalid or inactive.' }, { status: 400 });
      }

      if (currentBranchId && currentBranchId.toString() === requestedBranchId.toString()) {
        return NextResponse.json(
          { error: 'You are already assigned to this campus branch.' },
          { status: 400 }
        );
      }

      targetBranchId = branchExists._id;
    }

    if (type === 'DATE_SHEET') {
      if (!targetCourseId) {
        return NextResponse.json(
          { error: 'Please select which examination course you want to reschedule.' },
          { status: 400 }
        );
      }

      if (!requestedSlotId) {
        return NextResponse.json(
          { error: 'Please select your desired new examination time slot.' },
          { status: 400 }
        );
      }

      // Check course assignment
      const assigned = await Assignment.findOne({ studentId: student._id, courseId: targetCourseId });
      if (!assigned) {
        return NextResponse.json(
          { error: 'You are not enrolled in the specified course.' },
          { status: 400 }
        );
      }

      // Check requested slot validity
      const slotDoc = await ExamSlot.findOne({
        _id: requestedSlotId,
        courseId: targetCourseId,
        status: 'PUBLISHED',
      });

      if (!slotDoc) {
        return NextResponse.json(
          { error: 'The selected exam slot is invalid or not published.' },
          { status: 400 }
        );
      }

      // Determine current booked slot for that course if student has a saved date sheet
      const dateSheet = await DateSheet.findOne({ studentId: student._id });
      if (dateSheet) {
        const currentSel = await Selection.findOne({ dateSheetId: dateSheet._id, courseId: targetCourseId });
        if (currentSel) {
          if (currentSel.slotId.toString() === requestedSlotId.toString()) {
            return NextResponse.json(
              { error: 'You are already scheduled for this exam slot.' },
              { status: 400 }
            );
          }
          currentSlotId = currentSel.slotId;
        }
      }

      verifiedTargetCourseId = targetCourseId;
      verifiedRequestedSlotId = slotDoc._id;
    }

    const request = await ChangeRequest.create({
      studentId: student._id,
      type,
      reason: reason.trim(),
      status: 'PENDING',
      currentBranchId,
      requestedBranchId: targetBranchId,
      targetCourseId: verifiedTargetCourseId,
      currentSlotId,
      requestedSlotId: verifiedRequestedSlotId,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err: any) {
    console.error('Submit request error:', err);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
