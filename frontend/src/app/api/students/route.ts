import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User, Student, Assignment } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { program: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId', 'email active role')
      .populate('selectedBranchId', 'name code city')
      .sort({ registrationNumber: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      students,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
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
      email,
      fullName,
      registrationNumber,
      phone,
      cnic,
      dateOfBirth,
      gender,
      address,
      fatherName,
      parentCnic,
      occupation,
      contactNumber,
      emergencyContact,
      program,
      semester,
      sessionBatch,
      prevQualification,
      prevInstitute,
      marksOrCgpa,
    } = body;

    if (!email || !fullName || !registrationNumber || !cnic || !program || !semester) {
      return NextResponse.json({ error: 'Missing required student fields.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'Email address already in use.' }, { status: 400 });
    }

    const existingReg = await Student.findOne({ registrationNumber: registrationNumber.trim() });
    if (existingReg) {
      return NextResponse.json({ error: 'Registration number already exists.' }, { status: 400 });
    }

    // Create user (password hash initially null until email setup)
    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash: await bcrypt.hash('StudentPassword123!', 10), // default temp demo password or setup link
      role: 'STUDENT',
      active: true,
    });

    const student = await Student.create({
      userId: newUser._id,
      registrationNumber: registrationNumber.trim(),
      fullName: fullName.trim(),
      phone: phone?.trim() || '03000000000',
      cnic: cnic.trim(),
      dateOfBirth: new Date(dateOfBirth || '2003-01-01'),
      gender: gender || 'Male',
      address: address?.trim() || 'Default Campus Address',
      fatherName: fatherName?.trim() || 'Guardian Name',
      parentCnic: parentCnic?.trim() || '42101-0000000-0',
      occupation: occupation?.trim() || 'Service',
      contactNumber: contactNumber?.trim() || '03000000000',
      emergencyContact: emergencyContact?.trim() || '03000000000',
      program: program.trim(),
      semester: parseInt(semester, 10),
      sessionBatch: sessionBatch?.trim() || '2024-2028',
      prevQualification: prevQualification?.trim() || 'HSSC',
      prevInstitute: prevInstitute?.trim() || 'College',
      marksOrCgpa: marksOrCgpa?.trim() || '3.50 CGPA',
      assignmentsFinalized: false,
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (err: any) {
    console.error('Create student error:', err);
    return NextResponse.json({ error: 'Failed to create student record.' }, { status: 500 });
  }
}
