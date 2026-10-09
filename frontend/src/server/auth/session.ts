import crypto from 'crypto';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import { Session, User, Student, Branch, IUser, IStudent } from '@/server/models';

const SESSION_COOKIE_NAME = 'examslot_session';
const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '12', 10);

export async function createSession(userId: string) {
  await connectToDatabase();

  // Generate cryptographically random opaque token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_TTL_HOURS);

  await Session.create({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return rawToken;
}

export async function getAuthenticatedUser(): Promise<{ user: IUser; student?: IStudent | null } | null> {
  await connectToDatabase();

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const session = await Session.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  const user = await User.findById(session.userId);
  if (!user || !user.active) {
    return null;
  }

  let student: IStudent | null = null;
  if (user.role === 'STUDENT') {
    student = await Student.findOne({ userId: user._id }).populate('selectedBranchId');
  }

  return { user, student };
}

export async function revokeCurrentSession() {
  await connectToDatabase();

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await Session.updateOne({ tokenHash }, { revokedAt: new Date() });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
