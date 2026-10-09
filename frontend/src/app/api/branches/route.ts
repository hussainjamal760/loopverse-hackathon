import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Branch, Student } from '@/server/models';
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
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Branch.countDocuments(query);
    const branches = await Branch.find(query)
      .sort({ code: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return NextResponse.json({
      branches,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { code, name, city, address, contactNumber } = await req.json();

    if (!code || !name || !city || !address || !contactNumber) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const existing = await Branch.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'Branch code already exists.' }, { status: 400 });
    }

    const branch = await Branch.create({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      contactNumber: contactNumber.trim(),
      active: true,
    });

    return NextResponse.json({ branch }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}
