/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Requires: Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/lib/models/User';
import { withAuth } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';

async function handler(_req: NextRequest, user: JWTPayload): Promise<NextResponse> {
  await connectDB();

  const dbUser = await UserModel.findById(user.sub).select('-passwordHash');
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({
    id: String(dbUser._id),
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    organization: dbUser.organization,
    avatar: dbUser.avatar,
  });
}

export const GET = withAuth(handler);
