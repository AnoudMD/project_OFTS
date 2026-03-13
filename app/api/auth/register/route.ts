/**
 * POST /api/auth/register
 * Register a new user (producer, certifier, distributor, retailer, consumer).
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/lib/models/User';
import { signToken } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';

const VALID_ROLES = ['consumer', 'producer', 'certifier', 'distributor', 'retailer'] as const;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { name, email, password, role, organization } = body as Record<string, string>;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    if (!password || password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]))
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    if (!organization?.trim())
      return NextResponse.json({ error: 'Organization is required.' }, { status: 400 });

    await connectDB();

    // ── Duplicate check ───────────────────────────────────────────────────────
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // ── Hash & save ───────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      organization: organization.trim(),
    });

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
    }, { status: 201 });

  } catch (err) {
    console.error('[api/auth/register]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
