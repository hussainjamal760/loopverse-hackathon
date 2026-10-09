import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ChangeRequest, ChangeGrant, Student, User, AuditEvent } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';
import { sendRequestDecisionEmailNotification } from '@/server/email/mailer';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();
    const { status, remark } = await req.json();

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid decision status.' }, { status: 400 });
    }

    const request = await ChangeRequest.findById(id).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'email' },
    });

    if (!request) {
      return NextResponse.json({ error: 'Change request not found.' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'This request has already been reviewed.' }, { status: 400 });
    }

    const student = request.studentId as any;
    let grant = null;

    if (status === 'APPROVED') {
      // Per 06-API-AND-STATE-MACHINES.md: reject if same-type unused grant already exists
      const existingUnusedGrant = await ChangeGrant.findOne({
        studentId: student._id,
        type: request.type,
        consumedAt: null,
      });

      if (existingUnusedGrant) {
        return NextResponse.json(
          { error: `Student already holds an unused approved grant for ${request.type}. They must consume it before a new grant can be issued.` },
          { status: 409 }
        );
      }

      // Mint single-use grant
      grant = await ChangeGrant.create({
        requestId: request._id,
        studentId: student._id,
        type: request.type,
      });

      // Increment student version
      await Student.findByIdAndUpdate(student._id, { $inc: { version: 1 } });
    }

    request.status = status;
    request.remark = remark || null;
    request.reviewedBy = authData.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Log audit event
    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: status === 'APPROVED' ? 'APPROVE_CHANGE_REQUEST' : 'REJECT_CHANGE_REQUEST',
      entityType: 'ChangeRequest',
      entityId: request._id.toString(),
      sanitizedMetadata: JSON.stringify({
        type: request.type,
        studentReg: student.registrationNumber,
        status,
      }),
    });

    // Send decision notification email to student
    if (student.userId?.email) {
      sendRequestDecisionEmailNotification({
        userId: student.userId._id ? student.userId._id.toString() : student.userId.toString(),
        to: student.userId.email,
        studentName: student.fullName,
        requestType: request.type,
        decision: status as 'APPROVED' | 'REJECTED',
        remark: remark || undefined,
      }).catch((err) => console.error('Decision email error:', err));
    }

    return NextResponse.json({
      success: true,
      request,
      grant,
      message: `Request successfully ${status.toLowerCase()}.`,
    });
  } catch (err: any) {
    console.error('Decision error:', err);
    return NextResponse.json({ error: 'Failed to process request decision.' }, { status: 500 });
  }
}
