import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  Student,
  User,
  Assignment,
  DateSheet,
  ChangeRequest,
  PasswordToken,
  Session,
  AuditEvent,
  Course,
} from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const student = await Student.findById(id)
      .populate('userId', 'email role active createdAt')
      .populate('selectedBranchId', 'code name city address contactNumber active');

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // Load related academic history
    const assignments = await Assignment.find({ studentId: id }).populate('courseId');
    const dateSheet = await DateSheet.findOne({ studentId: id });
    const changeRequests = await ChangeRequest.find({ studentId: id }).sort({ createdAt: -1 });

    return NextResponse.json({
      student,
      assignments,
      hasDateSheet: !!dateSheet,
      dateSheet,
      changeRequests,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve student dossier' }, { status: 500 });
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

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // 1. Personal fields
    if (body.fullName !== undefined) student.fullName = body.fullName.trim();
    if (body.phone !== undefined) student.phone = body.phone.trim();
    if (body.cnic !== undefined) student.cnic = body.cnic.trim();
    if (body.dateOfBirth !== undefined) student.dateOfBirth = new Date(body.dateOfBirth);
    if (body.gender !== undefined) student.gender = body.gender.trim();
    if (body.address !== undefined) student.address = body.address.trim();

    // 2. Parent/Guardian fields
    if (body.fatherName !== undefined) student.fatherName = body.fatherName.trim();
    if (body.parentCnic !== undefined) student.parentCnic = body.parentCnic.trim();
    if (body.occupation !== undefined) student.occupation = body.occupation.trim();
    if (body.contactNumber !== undefined) student.contactNumber = body.contactNumber.trim();
    if (body.emergencyContact !== undefined) student.emergencyContact = body.emergencyContact.trim();

    // 3. Academic fields
    if (body.registrationNumber !== undefined && body.registrationNumber.trim() !== student.registrationNumber) {
      const regExists = await Student.findOne({
        registrationNumber: body.registrationNumber.trim(),
        _id: { $ne: id },
      });
      if (regExists) {
        return NextResponse.json({ error: 'Registration number already assigned to another student.' }, { status: 400 });
      }
      student.registrationNumber = body.registrationNumber.trim();
    }

    if (body.program !== undefined) student.program = body.program.trim();
    if (body.semester !== undefined) student.semester = parseInt(body.semester, 10);
    if (body.sessionBatch !== undefined) student.sessionBatch = body.sessionBatch.trim();
    if (body.prevQualification !== undefined) student.prevQualification = body.prevQualification.trim();
    if (body.prevInstitute !== undefined) student.prevInstitute = body.prevInstitute.trim();
    if (body.marksOrCgpa !== undefined) student.marksOrCgpa = body.marksOrCgpa.trim();

    // 4. Branch allocation
    if (body.selectedBranchId !== undefined) {
      student.selectedBranchId = body.selectedBranchId || null;
    }

    // 5. Account status toggle on User model
    if (body.active !== undefined && student.userId) {
      await User.findByIdAndUpdate(student.userId, { active: Boolean(body.active) });
    }

    if (body.assignmentsFinalized !== undefined) {
      student.assignmentsFinalized = Boolean(body.assignmentsFinalized);
    }

    if (Array.isArray(body.courseIds)) {
      await Assignment.deleteMany({ studentId: id });
      const validCourses = await Course.find({ _id: { $in: body.courseIds }, active: true });
      const assignmentsToCreate = validCourses.map((c) => ({
        studentId: student._id,
        courseId: c._id,
      }));
      if (assignmentsToCreate.length > 0) {
        await Assignment.insertMany(assignmentsToCreate);
      }
      if (body.courseIds.length >= 4) {
        student.assignmentsFinalized = true;
      }
    }

    student.version = (student.version || 1) + 1;
    await student.save();

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'UPDATE_STUDENT',
      entityType: 'Student',
      entityId: student._id.toString(),
      sanitizedMetadata: JSON.stringify({
        registrationNumber: student.registrationNumber,
        fullName: student.fullName,
      }),
    });

    const updated = await Student.findById(id)
      .populate('userId', 'email role active')
      .populate('selectedBranchId', 'code name city');

    return NextResponse.json({ student: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
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

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // Integrity check per artifacts/05-DATA-MODEL.md
    const hasDateSheet = await DateSheet.exists({ studentId: id });
    const hasAssignments = await Assignment.exists({ studentId: id });

    if (hasDateSheet || hasAssignments) {
      return NextResponse.json(
        {
          error:
            'Student has active academic history (date sheet or course assignments). Academic integrity prohibits deletion. Deactivate the student account instead.',
          canDeactivate: true,
        },
        { status: 409 }
      );
    }

    // Clean up student, user, tokens, and active sessions
    if (student.userId) {
      await PasswordToken.deleteMany({ userId: student.userId });
      await Session.deleteMany({ userId: student.userId });
      await User.findByIdAndDelete(student.userId);
    }

    await Student.findByIdAndDelete(id);

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'DELETE_STUDENT',
      entityType: 'Student',
      entityId: id,
      sanitizedMetadata: JSON.stringify({
        registrationNumber: student.registrationNumber,
        fullName: student.fullName,
      }),
    });

    return NextResponse.json({ success: true, message: `Student ${student.registrationNumber} deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
