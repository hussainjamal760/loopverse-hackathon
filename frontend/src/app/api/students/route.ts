import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import {
  User,
  Student,
  Assignment,
  PasswordToken,
  AuditEvent,
  Branch,
  Course,
} from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';
import { sendStudentSetupEmail } from '@/server/email/mailer';

export async function GET(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const programFilter = searchParams.get('program') || '';
    const branchFilter = searchParams.get('branchId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (programFilter) {
      query.program = programFilter;
    }
    if (branchFilter) {
      query.selectedBranchId = branchFilter;
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId', 'email active role createdAt')
      .populate('selectedBranchId', 'code name city')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      students,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch students list' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      // 1. Personal Group
      fullName,
      email,
      phone,
      cnic,
      dateOfBirth,
      gender,
      address,
      photoUrl,
      // 2. Parent / Guardian Group
      fatherName,
      parentCnic,
      occupation,
      contactNumber,
      emergencyContact,
      // 3. Academic Group
      registrationNumber,
      program,
      semester,
      sessionBatch,
      prevQualification,
      prevInstitute,
      marksOrCgpa,
      // 4. Branch & Course Assignments
      selectedBranchId,
      courseIds,
    } = body;

    // Comprehensive validation per 01-REQUIREMENTS.md
    if (!fullName || !email || !phone || !cnic || !dateOfBirth || !gender || !address) {
      return NextResponse.json(
        { error: 'All personal information fields (name, email, phone, CNIC, DOB, gender, address) are required.' },
        { status: 400 }
      );
    }

    if (!fatherName || !parentCnic || !occupation || !contactNumber || !emergencyContact) {
      return NextResponse.json(
        { error: 'All guardian details (father name, parent CNIC, occupation, contacts) are required.' },
        { status: 400 }
      );
    }

    if (!registrationNumber || !program || !semester || !sessionBatch || !prevQualification || !prevInstitute || !marksOrCgpa) {
      return NextResponse.json(
        { error: 'All academic details (registration number, program, semester, batch, previous qualifications) are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanRegNo = registrationNumber.trim().toUpperCase();

    // Check duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: `User with email "${normalizedEmail}" is already registered.` }, { status: 400 });
    }

    // Check duplicate registration number
    const existingStudent = await Student.findOne({ registrationNumber: cleanRegNo });
    if (existingStudent) {
      return NextResponse.json(
        { error: `Registration number "${cleanRegNo}" is already assigned to an existing student.` },
        { status: 400 }
      );
    }

    // Optional branch validation
    let validBranchId = null;
    if (selectedBranchId) {
      const branch = await Branch.findById(selectedBranchId);
      if (branch) validBranchId = branch._id;
    }

    // 1. Create User account (initially passwordHash null until setup)
    const tempInitialHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash: tempInitialHash,
      role: 'STUDENT',
      active: true,
    });

    // 2. Create Student profile with all required groups
    const student = await Student.create({
      userId: newUser._id,
      registrationNumber: cleanRegNo,
      fullName: fullName.trim(),
      phone: phone.trim(),
      cnic: cnic.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender: gender.trim(),
      address: address.trim(),
      photoUrl: photoUrl || null,
      fatherName: fatherName.trim(),
      parentCnic: parentCnic.trim(),
      occupation: occupation.trim(),
      contactNumber: contactNumber.trim(),
      emergencyContact: emergencyContact.trim(),
      program: program.trim(),
      semester: parseInt(semester, 10),
      sessionBatch: sessionBatch.trim(),
      prevQualification: prevQualification.trim(),
      prevInstitute: prevInstitute.trim(),
      marksOrCgpa: marksOrCgpa.trim(),
      selectedBranchId: validBranchId,
      assignmentsFinalized: Array.isArray(courseIds) && courseIds.length >= 4,
      version: 1,
    });

    // 3. Optional initial course assignments
    if (Array.isArray(courseIds) && courseIds.length > 0) {
      const validCourses = await Course.find({ _id: { $in: courseIds }, active: true });
      const assignmentsToCreate = validCourses.map((c) => ({
        studentId: student._id,
        courseId: c._id,
      }));
      if (assignmentsToCreate.length > 0) {
        await Assignment.insertMany(assignmentsToCreate);
      }
    }

    // 4. Generate secure token for account password setup
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours per policy

    await PasswordToken.create({
      userId: newUser._id,
      tokenHash,
      purpose: 'SETUP',
      expiresAt,
    });

    // 5. Construct setup URL
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const setupUrl = `${appUrl}/set-password?token=${rawToken}`;

    // 6. Send invitation email & log outbox
    const emailResult = await sendStudentSetupEmail({
      userId: newUser._id.toString(),
      to: normalizedEmail,
      studentName: student.fullName,
      setupUrl,
      expiresInHours: 24,
    });

    // 7. Record audit log
    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'CREATE_STUDENT',
      entityType: 'Student',
      entityId: student._id.toString(),
      sanitizedMetadata: JSON.stringify({
        registrationNumber: student.registrationNumber,
        email: normalizedEmail,
        program: student.program,
        emailSent: emailResult.sent,
      }),
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'email role active')
      .populate('selectedBranchId', 'code name city');

    return NextResponse.json(
      {
        student: populatedStudent,
        setupUrl,
        emailSent: emailResult.sent,
        message: 'Student account and academic dossier created successfully.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Failed to create student:', err);
    return NextResponse.json({ error: err.message || 'Failed to create student record.' }, { status: 500 });
  }
}
