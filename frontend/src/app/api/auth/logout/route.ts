import { NextResponse } from 'next/server';
import { revokeCurrentSession } from '@/server/auth/session';

export async function POST() {
  try {
    await revokeCurrentSession();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
