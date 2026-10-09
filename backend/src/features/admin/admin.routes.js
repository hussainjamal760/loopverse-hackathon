const express = require('express');
const {
  Student,
  Branch,
  Course,
  ExamSlot,
  ChangeRequest,
  DateSheet,
  AuditEvent,
} = require('../../models');
const { getAuthenticatedUser } = require('../auth/session.service');

const router = express.Router();
const SESSION_COOKIE_NAME = 'examslot_session';

// Auth middleware for admin routes
async function requireAdmin(req, res, next) {
  const cookieHeader = req.headers.cookie;
  let rawToken = null;
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
    rawToken = match ? decodeURIComponent(match[1]) : null;
  }

  const authData = await getAuthenticatedUser(rawToken);
  if (!authData || authData.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized: Admin access required' });
  }

  req.adminUser = authData.user;
  next();
}

/**
 * GET /api/admin/overview
 */
router.get('/overview', requireAdmin, async (req, res) => {
  try {
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

    const planningInProgress = await Student.countDocuments({
      assignmentsFinalized: true,
      _id: { $nin: studentIdsWithSheets },
    });

    const recentRequestsRaw = await ChangeRequest.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('studentId', 'fullName registrationNumber')
      .lean();

    const recentRequests = recentRequestsRaw.map((r) => ({
      id: String(r._id),
      studentName: r.studentId?.fullName || 'Student',
      registrationNumber: r.studentId?.registrationNumber || 'N/A',
      initials: (r.studentId?.fullName || 'ST')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      requestType: r.type === 'BRANCH' ? 'Branch change' : 'Date sheet change',
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt,
    }));

    const upcomingSlotsRaw = await ExamSlot.find({ status: 'PUBLISHED' })
      .sort({ startsAt: 1 })
      .limit(5)
      .populate('courseId', 'code title department')
      .lean();

    const upcomingSlots = upcomingSlotsRaw.map((s) => ({
      id: String(s._id),
      courseCode: s.courseId?.code || 'N/A',
      courseTitle: s.courseId?.title || 'Unknown Course',
      department: s.courseId?.department || 'General',
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      status: s.status,
    }));

    const recentActivityRaw = await AuditEvent.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('actorUserId', 'email role')
      .lean();

    const recentActivity = recentActivityRaw.map((a) => ({
      id: String(a._id),
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      actorEmail: a.actorUserId?.email || 'admin@examslot.edu.pk',
      metadata: a.sanitizedMetadata,
      createdAt: a.createdAt,
    }));

    const activeBranches = await Branch.find({ active: true }).lean();
    const branchMetrics = await Promise.all(
      activeBranches.map(async (b) => {
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

    const departmentSlotMetrics = departmentAgg.map((d) => ({
      department: d._id || 'General',
      coursesCount: d.coursesCount,
      publishedSlots: d.publishedSlots,
      draftSlots: d.draftSlots,
    }));

    const requestBreakdownAgg = await ChangeRequest.aggregate([
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    const requestBreakdown = requestBreakdownAgg.map((r) => ({
      type: r._id.type,
      status: r._id.status,
      count: r.count,
    }));

    return res.json({
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
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin overview data', details: err.message });
  }
});

module.exports = router;
