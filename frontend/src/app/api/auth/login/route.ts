import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User, Student } from '@/server/models';
import { createSession } from '@/server/auth/session';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, active: true });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Account setup pending. Please check your setup email.' },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Create session and set HttpOnly cookie
    await createSession(user._id.toString());

    let student = null;
    if (user.role === 'STUDENT') {
      student = await Student.findOne({ userId: user._id });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      student,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
