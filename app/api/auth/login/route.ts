/**
 * POST /api/auth/login
 * Authenticate with email + password. Returns JWT.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/lib/models/User';
import { signToken } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = (await req.json()) as { email: string; password: string };

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const jwtPayload: JWTPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      organization: user.organization,
    };

    const token = await signToken(jwtPayload);

    return NextResponse.json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });

  } catch (err) {
    console.error('[api/auth/login]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
