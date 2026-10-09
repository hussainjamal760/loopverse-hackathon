const crypto = require('crypto');
const { Session, User, Student } = require('../../models');

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '12', 10);

async function createSession(userId) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_TTL_HOURS);

  await Session.create({
    userId,
    tokenHash,
    expiresAt,
  });

  return { rawToken, expiresAt };
}

async function getAuthenticatedUser(rawToken) {
  if (!rawToken) return null;

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const session = await Session.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const user = await User.findById(session.userId);
  if (!user || !user.active) return null;

  let student = null;
  if (user.role === 'STUDENT') {
    student = await Student.findOne({ userId: user._id });
  }

  return { user, student };
}

async function revokeSession(rawToken) {
  if (!rawToken) return;

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await Session.updateOne({ tokenHash }, { revokedAt: new Date() });
}

module.exports = {
  createSession,
  getAuthenticatedUser,
  revokeSession,
};
