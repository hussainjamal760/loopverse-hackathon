const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Student } = require('../../models');
const { createSession, getAuthenticatedUser, revokeSession } = require('./session.service');

const router = express.Router();
const SESSION_COOKIE_NAME = 'examslot_session';

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, active: true });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.passwordHash) {
      return res.status(403).json({ error: 'Account setup pending. Please check your setup email.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const { rawToken, expiresAt } = await createSession(user._id.toString());

    res.cookie(SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    let student = null;
    if (user.role === 'STUDENT') {
      student = await Student.findOne({ userId: user._id });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      student,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An unexpected authentication error occurred.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie;
    let rawToken = null;
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
      rawToken = match ? decodeURIComponent(match[1]) : null;
    }

    if (rawToken) {
      await revokeSession(rawToken);
    }

    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to log out.' });
  }
});

/**
 * GET /api/auth/me or GET /api/me
 */
router.get('/me', async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie;
    let rawToken = null;
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
      rawToken = match ? decodeURIComponent(match[1]) : null;
    }

    const authData = await getAuthenticatedUser(rawToken);
    if (!authData) {
      return res.status(401).json({ authenticated: false });
    }

    const { user, student } = authData;
    return res.json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      student: student ? {
        id: student._id,
        fullName: student.fullName,
        registrationNumber: student.registrationNumber,
        selectedBranchId: student.selectedBranchId,
        assignmentsFinalized: student.assignmentsFinalized,
        program: student.program,
        semester: student.semester,
        sessionBatch: student.sessionBatch,
      } : null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
