import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  ChangeRequest,
  ChangeGrant,
  Student,
  Branch,
  ExamSlot,
  DateSheet,
  Selection,
  SheetRevision,
  AuditEvent,
} from '@/server/models';
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
      populate: [
        { path: 'userId', select: 'email' },
        { path: 'selectedBranchId', select: 'name code city address' },
      ],
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
      // 1. Process BRANCH change approval
      if (request.type === 'BRANCH') {
        if (request.requestedBranchId) {
          const newBranch = await Branch.findById(request.requestedBranchId);
          if (!newBranch) {
            return NextResponse.json({ error: 'Target branch no longer exists.' }, { status: 400 });
          }

          // Immediately update student's assigned branch across the system
          await Student.findByIdAndUpdate(student._id, {
            selectedBranchId: newBranch._id,
            $inc: { version: 1 },
          });

          // If student has an existing date sheet, create a new revision snapshot with new branch
          const dateSheet = await DateSheet.findOne({ studentId: student._id });
          if (dateSheet) {
            const latestRev = await SheetRevision.findOne({ dateSheetId: dateSheet._id }).sort({ revision: -1 });
            const nextRev = (latestRev?.revision || 1) + 1;

            await SheetRevision.create({
              dateSheetId: dateSheet._id,
              revision: nextRev,
              branchId: newBranch._id,
              documentSnapshot: JSON.stringify({
                studentName: student.fullName,
                registrationNumber: student.registrationNumber,
                branchName: newBranch.name,
                branchAddress: newBranch.address,
                savedAt: new Date(),
              }),
              reason: `Campus branch transfer approved by Examination Directorate to ${newBranch.name}.`,
            });

            dateSheet.currentRevision = nextRev;
            dateSheet.updatedAt = new Date();
            await dateSheet.save();
          }

          // Record consumed grant
          grant = await ChangeGrant.create({
            requestId: request._id,
            studentId: student._id,
            type: 'BRANCH',
            consumedAt: new Date(),
          });
        } else {
          // Fallback legacy open grant
          grant = await ChangeGrant.create({
            requestId: request._id,
            studentId: student._id,
            type: 'BRANCH',
          });
          await Student.findByIdAndUpdate(student._id, { $inc: { version: 1 } });
        }
      }

      // 2. Process DATE_SHEET change approval
      if (request.type === 'DATE_SHEET') {
        if (request.targetCourseId && request.requestedSlotId) {
          const targetSlot = await ExamSlot.findById(request.requestedSlotId);
          if (!targetSlot) {
            return NextResponse.json({ error: 'Target exam slot no longer exists.' }, { status: 400 });
          }

          // Ensure student has a DateSheet record
          let dateSheet = await DateSheet.findOne({ studentId: student._id });
          if (!dateSheet) {
            dateSheet = await DateSheet.create({
              studentId: student._id,
              currentRevision: 1,
              savedAt: new Date(),
            });
          }

          // Update student's exam slot selection for that course
          await Selection.findOneAndUpdate(
            { dateSheetId: dateSheet._id, courseId: request.targetCourseId },
            { slotId: targetSlot._id },
            { upsert: true, new: true }
          );

          // Update date sheet revision
          const currentStudent = await Student.findById(student._id).populate('selectedBranchId');
          const branchDoc = currentStudent?.selectedBranchId as any;
          const latestRev = await SheetRevision.findOne({ dateSheetId: dateSheet._id }).sort({ revision: -1 });
          const nextRev = (latestRev?.revision || 1) + 1;

          await SheetRevision.create({
            dateSheetId: dateSheet._id,
            revision: nextRev,
            branchId: branchDoc?._id || student.selectedBranchId,
            documentSnapshot: JSON.stringify({
              studentName: student.fullName,
              registrationNumber: student.registrationNumber,
              branchName: branchDoc?.name || 'Assigned Campus',
              branchAddress: branchDoc?.address || '',
              savedAt: new Date(),
            }),
            reason: `Exam slot timetable adjustment approved by Examination Directorate.`,
          });

          dateSheet.currentRevision = nextRev;
          dateSheet.updatedAt = new Date();
          await dateSheet.save();

          await Student.findByIdAndUpdate(student._id, { $inc: { version: 1 } });

          // Record consumed grant
          grant = await ChangeGrant.create({
            requestId: request._id,
            studentId: student._id,
            type: 'DATE_SHEET',
            consumedAt: new Date(),
          });
        } else {
          // Fallback legacy open grant
          grant = await ChangeGrant.create({
            requestId: request._id,
            studentId: student._id,
            type: 'DATE_SHEET',
          });
          await Student.findByIdAndUpdate(student._id, { $inc: { version: 1 } });
        }
      }
    }

    // Update request state
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
        requestedBranchId: request.requestedBranchId?.toString(),
        targetCourseId: request.targetCourseId?.toString(),
        requestedSlotId: request.requestedSlotId?.toString(),
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
      message: `Request successfully ${status.toLowerCase()}.${status === 'APPROVED' ? ' Student schedule and records updated automatically.' : ''}`,
    });
  } catch (err: any) {
    console.error('Decision error:', err);
    return NextResponse.json({ error: 'Failed to process request decision.' }, { status: 500 });
  }
}
