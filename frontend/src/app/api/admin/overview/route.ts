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
  AuditEvent,
  Assignment,
  Selection,
} from '@/server/models';

export async function GET() {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Core Counts and IDs
    const [
      totalStudents,
      totalBranches,
      totalCourses,
      publishedSlots,
      draftSlots,
      pendingRequests,
      totalSavedSheets,
      needAssignment,
      studentIdsWithSheets,
    ] = await Promise.all([
      Student.countDocuments(),
      Branch.countDocuments({ active: true }),
      Course.countDocuments({ active: true }),
      ExamSlot.countDocuments({ status: 'PUBLISHED' }),
      ExamSlot.countDocuments({ status: 'DRAFT' }),
      ChangeRequest.countDocuments({ status: 'PENDING' }),
      DateSheet.countDocuments(),
      Student.countDocuments({ assignmentsFinalized: false }),
      DateSheet.distinct('studentId'),
    ]);

    // 2. Planning in progress: assignments finalized but no date sheet saved yet
    const planningInProgress = await Student.countDocuments({
      assignmentsFinalized: true,
      _id: { $nin: studentIdsWithSheets },
    });

    // 3. Recent Change Requests
    const recentRequestsRaw = await ChangeRequest.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate({
        path: 'studentId',
        select: 'fullName registrationNumber program selectedBranchId',
        populate: { path: 'selectedBranchId', select: 'name code city' },
      })
      .populate('currentBranchId', 'name code city')
      .populate('requestedBranchId', 'name code city')
      .populate('targetCourseId', 'code title department')
      .populate('currentSlotId', 'startsAt endsAt')
      .populate('requestedSlotId', 'startsAt endsAt')
      .lean();

    const studentIds = recentRequestsRaw
      .map((r: any) => r.studentId?._id)
      .filter(Boolean);

    const [assignmentsByStudent, dateSheetsByStudent] = await Promise.all([
      studentIds.length > 0
        ? Assignment.aggregate([
            { $match: { studentId: { $in: studentIds } } },
            { $group: { _id: '$studentId', count: { $sum: 1 } } },
          ])
        : [],
      studentIds.length > 0
        ? DateSheet.find({ studentId: { $in: studentIds } }).select('_id studentId').lean()
        : [],
    ]);

    const assignmentCountMap = new Map(
      assignmentsByStudent.map((a: any) => [String(a._id), a.count])
    );
    const dateSheetIds = dateSheetsByStudent.map((ds: any) => ds._id);
    const selectionsBySheet = dateSheetIds.length > 0
      ? await Selection.aggregate([
          { $match: { dateSheetId: { $in: dateSheetIds } } },
          { $group: { _id: '$dateSheetId', count: { $sum: 1 } } },
        ])
      : [];
    const selectionCountMap = new Map(
      selectionsBySheet.map((s: any) => [String(s._id), s.count])
    );
    const studentToSheetMap = new Map(
      dateSheetsByStudent.map((ds: any) => [String(ds.studentId), String(ds._id)])
    );

    const recentRequests = recentRequestsRaw.map((r: any) => {
      const sId = r.studentId?._id ? String(r.studentId._id) : '';
      const totalCourses = assignmentCountMap.get(sId) || 0;
      const sheetId = studentToSheetMap.get(sId);
      const bookedCourses = sheetId ? (selectionCountMap.get(sheetId) || 0) : 0;
      const branchName =
        r.currentBranchId?.name ||
        r.studentId?.selectedBranchId?.name ||
        'Main Campus';
      const branchCity =
        r.currentBranchId?.city ||
        r.studentId?.selectedBranchId?.city ||
        '';
      const requestedBranchName = r.requestedBranchId?.name || null;

      let currentSlotTime: string | null = null;
      if (r.currentSlotId?.startsAt) {
        try {
          const sDate = new Date(r.currentSlotId.startsAt);
          currentSlotTime = `${sDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, ${sDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } catch {}
      }

      return {
        id: String(r._id),
        studentName: r.studentId?.fullName || 'Student',
        registrationNumber: r.studentId?.registrationNumber || 'N/A',
        program: r.studentId?.program || 'Degree Program',
        branchName,
        branchCity,
        requestedBranchName,
        targetCourseCode: r.targetCourseId?.code || null,
        targetCourseTitle: r.targetCourseId?.title || null,
        currentSlotTime,
        bookedCoursesCount: bookedCourses,
        totalCoursesCount: totalCourses,
        initials: (r.studentId?.fullName || 'ST')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        requestType: r.type === 'BRANCH' ? 'Branch change' : 'Date sheet change',
        type: r.type,
        status: r.status,
        reason: r.reason || '',
        remark: r.remark || '',
        createdAt: r.createdAt,
      };
    });

    // 4. Upcoming Exam Slots
    const upcomingSlotsRaw = await ExamSlot.find({ status: 'PUBLISHED' })
      .sort({ startsAt: 1 })
      .limit(5)
      .populate('courseId', 'code title department')
      .lean();

    const upcomingSlots = upcomingSlotsRaw.map((s: any) => ({
      id: String(s._id),
      courseCode: s.courseId?.code || 'N/A',
      courseTitle: s.courseId?.title || 'Unknown Course',
      department: s.courseId?.department || 'General',
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      status: s.status,
    }));

    // 5. Recent Admin Activity (from live AuditEvent collection)
    const recentActivityRaw = await AuditEvent.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('actorUserId', 'email role')
      .lean();

    const recentActivity = recentActivityRaw.map((a: any) => ({
      id: String(a._id),
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      actorEmail: a.actorUserId?.email || 'admin@examslot.edu.pk',
      metadata: a.sanitizedMetadata,
      createdAt: a.createdAt,
    }));

    // 6. Branch Metrics for Charts (Students enrolled vs Date Sheets saved per active branch)
    const activeBranches = await Branch.find({ active: true }).lean();
    const branchMetrics = await Promise.all(
      activeBranches.map(async (b: any) => {
        const branchStudentIds = await Student.distinct('_id', { selectedBranchId: b._id });
        const branchTotalStudents = branchStudentIds.length;
        const branchSavedSheets = await DateSheet.countDocuments({
          studentId: { $in: branchStudentIds },
        });

        return {
          id: String(b._id),
          name: b.name,
          code: b.code,
          city: b.city,
          totalStudents: branchTotalStudents,
          savedSheets: branchSavedSheets,
        };
      })
    );

    // 7. Department Slot Distribution Metrics
    const departmentAgg = await Course.aggregate([
      { $match: { active: true } },
      {
        $lookup: {
          from: 'examslots',
          localField: '_id',
          foreignField: 'courseId',
          as: 'slots',
        },
      },
      {
        $group: {
          _id: '$department',
          coursesCount: { $sum: 1 },
          publishedSlots: {
            $sum: {
              $size: {
                $filter: {
                  input: '$slots',
                  as: 's',
                  cond: { $eq: ['$$s.status', 'PUBLISHED'] },
                },
              },
            },
          },
          draftSlots: {
            $sum: {
              $size: {
                $filter: {
                  input: '$slots',
                  as: 's',
                  cond: { $eq: ['$$s.status', 'DRAFT'] },
                },
              },
            },
          },
        },
      },
      { $sort: { publishedSlots: -1 } },
    ]);

    const departmentSlotMetrics = departmentAgg.map((d: any) => ({
      department: d._id || 'General',
      coursesCount: d.coursesCount,
      publishedSlots: d.publishedSlots,
      draftSlots: d.draftSlots,
    }));

    // 8. Request Status Breakdown
    const requestBreakdownAgg = await ChangeRequest.aggregate([
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    const requestBreakdown = requestBreakdownAgg.map((r: any) => ({
      type: r._id.type,
      status: r._id.status,
      count: r.count,
    }));

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
        needAssignment,
        planningInProgress,
      },
      recentRequests,
      upcomingSlots,
      recentActivity,
      branchMetrics,
      departmentSlotMetrics,
      requestBreakdown,
    });
  } catch (error: any) {
    console.error('Admin overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin overview data', details: error.message },
      { status: 500 }
    );
  }
}
