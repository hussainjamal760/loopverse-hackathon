const express = require('express');
const { Student, Branch, Course, ExamSlot, ChangeRequest, DateSheet } = require('../../models');
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
      },
      recentRequests,
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin overview data', details: err.message });
  }
});

module.exports = router;
