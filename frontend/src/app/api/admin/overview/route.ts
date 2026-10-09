import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAuthenticatedUser } from '@/server/auth/session';
import {
  Student,
  Branch,
  Course,
  ExamSlot,
  ChangeRequest,
  DateSheet,
} from '@/server/models';

export async function GET() {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [
      totalStudents,
      totalBranches,
      totalCourses,
      publishedSlots,
      draftSlots,
      pendingRequests,
      recentRequests,
      totalSavedSheets,
    ] = await Promise.all([
      Student.countDocuments(),
      Branch.countDocuments({ active: true }),
      Course.countDocuments({ active: true }),
      ExamSlot.countDocuments({ status: 'PUBLISHED' }),
      ExamSlot.countDocuments({ status: 'DRAFT' }),
      ChangeRequest.countDocuments({ status: 'PENDING' }),
      ChangeRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('studentId', 'fullName registrationNumber')
        .lean(),
      DateSheet.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalBranches,
        totalCourses,
        totalSlots: publishedSlots + draftSlots,
        publishedSlots,
        draftSlots,
        pendingRequests,
        totalSavedSheets,
      },
      recentRequests,
    });
  } catch (error: any) {
    console.error('Admin overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin overview data', details: error.message },
      { status: 500 }
    );
  }
}
