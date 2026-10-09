import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ChangeRequest, ChangeGrant } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

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

    const request = await ChangeRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Change request not found.' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'This request has already been reviewed.' }, { status: 400 });
    }

    request.status = status;
    request.remark = remark || null;
    request.reviewedBy = authData.user._id;
    request.reviewedAt = new Date();
    await request.save();

    let grant = null;
    if (status === 'APPROVED') {
      // Create single-use grant
      grant = await ChangeGrant.create({
        requestId: request._id,
        studentId: request.studentId,
        type: request.type,
      });
    }

    return NextResponse.json({
      success: true,
      request,
      grant,
    });
  } catch (err: any) {
    console.error('Decision error:', err);
    return NextResponse.json({ error: 'Failed to process request decision.' }, { status: 500 });
  }
}
