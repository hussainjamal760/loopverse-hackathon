import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ code: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { code, title, creditHours, department } = await req.json();

    if (!code || !title || !creditHours || !department) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const existing = await Course.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'Course code already exists.' }, { status: 400 });
    }

    const course = await Course.create({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      creditHours: parseInt(creditHours, 10),
      department: department.trim(),
      active: true,
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
