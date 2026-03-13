/**
 * lib/auth.ts
 * JWT sign / verify helpers and role-based guard for Next.js Route Handlers.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'ofts-super-secret-dev-key-change-in-production'
);
const JWT_EXPIRES = '7d';

export interface JWTPayload {
  sub: string;          // user._id (string)
  email: string;
  role: string;
  name: string;
  organization: string;
}

// ── Sign ──────────────────────────────────────────────────────────────────────

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES)
    .sign(JWT_SECRET);
}

// ── Verify ────────────────────────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ── Extract Bearer token from request ────────────────────────────────────────

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// ── Route guard middleware ────────────────────────────────────────────────────

type AllowedRole = string | string[];

/**
 * Wraps a Next.js route handler with JWT auth + optional role check.
 *
 * Usage:
 *   export const POST = withAuth(handler, ['producer', 'certifier']);
 */
export function withAuth(
  handler: (req: NextRequest, user: JWTPayload, params?: Record<string, string>) => Promise<NextResponse>,
  allowedRoles?: AllowedRole
) {
  return async (req: NextRequest, context?: { params?: Record<string, string> }): Promise<NextResponse> => {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized — no token provided.' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized — invalid or expired token.' }, { status: 401 });
    }

    if (allowedRoles) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!roles.includes(user.role)) {
        return NextResponse.json(
          { error: `Forbidden — requires role: ${roles.join(' or ')}.` },
          { status: 403 }
        );
      }
    }

    return handler(req, user, context?.params);
  };
}
